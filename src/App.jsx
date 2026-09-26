import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';
import {
  AppLayout,
  Container,
  Header,
  SpaceBetween,
  Button,
  Table,
  Box,
  TextFilter,
  Pagination,
  FormField,
  Input,
  Modal,
  Form,
  Select,
  StatusIndicator,
  CollectionPreferences,
  Toggle,
  Link,
  SplitPanel,
  MixedLineBarChart,
  Flashbar,
} from '@cloudscape-design/components';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import { translations } from './translations';
import { changelog } from './changelog';
import packageJson from '../package.json';
import {
  toLocale,
  parseParticipantRows,
  findDuplicates,
  formatNames,
  normalizeName,
  createId,
  filterParticipants,
  sortParticipants,
  computeStats,
  computeProgressSeries,
  buildExportRows,
  buildExportFileName,
} from './lib/participants';
import {
  STORAGE_KEY,
  SETTINGS_KEY,
  LAST_LOAD_KEY,
  readJSON,
  writeJSON,
  writeText,
  removeKey,
} from './lib/storage';

const APP_VERSION = packageJson.version;

function CheckInButton({ item, onToggle, t }) {
  if (!item.checkedIn) {
    return (
      <Button variant="primary" onClick={() => onToggle(item)}>
        {t.checkIn}
      </Button>
    );
  }

  return (
    <Button variant="normal" iconName="status-positive" onClick={() => onToggle(item)}>
      {t.statusCheckedIn}
    </Button>
  );
}

function App() {
  // Stored settings are read once, synchronously, to initialize state
  const [storedSettings] = useState(() => readJSON(SETTINGS_KEY, {}));

  const [participants, setParticipants] = useState(() => readJSON(STORAGE_KEY, []));
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(storedSettings.pageSize ?? 0);
  const [sortingColumn, setSortingColumn] = useState({ sortingField: 'lastName' });
  const [isAscending, setIsAscending] = useState(true);
  const [participantModal, setParticipantModal] = useState(null); // null | { mode: 'add'|'edit', data: {...}, errors: {...} }
  const fileInputRef = useRef(null);
  const editNameInputRef = useRef(null);
  const participantFirstNameRef = useRef(null);
  const addJustSubmittedRef = useRef(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingCheckOut, setPendingCheckOut] = useState(null);
  // null | { messageKey, choices: [{ action, labelKey, primary? }] }
  const [confirmModal, setConfirmModal] = useState(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [pendingEventName, setPendingEventName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [splitPanelPreferences, setSplitPanelPreferences] = useState(
    storedSettings.splitPanelPreferences ?? { position: 'side' }
  );

  // Settings state, defaulting to French and the system dark mode preference
  const [language, setLanguage] = useState(
    storedSettings.language ?? { value: 'fr_FR', label: 'Français (FR)' }
  );
  const [darkMode, setDarkMode] = useState(
    () => storedSettings.darkMode ?? !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
  );
  const [eventName, setEventName] = useState(storedSettings.eventName ?? '');
  const [statusFilter, setStatusFilter] = useState(storedSettings.statusFilter ?? { value: 'all' });

  // Get translations
  const t = translations[language.value] ?? translations.fr_FR;
  const locale = toLocale(language.value);

  // Timestamp of this page load, shown in the settings panel
  const [lastLoad] = useState(() => new Date().toISOString());

  useEffect(() => {
    writeText(LAST_LOAD_KEY, lastLoad);
  }, [lastLoad]);

  // Persist participants whenever they change
  useEffect(() => {
    if (participants.length > 0) {
      writeJSON(STORAGE_KEY, participants);
    } else {
      removeKey(STORAGE_KEY);
    }
  }, [participants]);

  // Persist settings whenever they change
  useEffect(() => {
    writeJSON(SETTINGS_KEY, {
      language,
      darkMode,
      eventName,
      pageSize,
      statusFilter,
      splitPanelPreferences,
    });
  }, [language, darkMode, eventName, pageSize, statusFilter, splitPanelPreferences]);

  // Apply dark mode
  useEffect(() => {
    applyMode(darkMode ? Mode.Dark : Mode.Light);
  }, [darkMode]);

  useEffect(() => {
    if (showEditNameModal) {
      setTimeout(() => editNameInputRef.current?.focus(), 50);
    }
  }, [showEditNameModal]);

  const notify = (type, content) => {
    const id = createId('notification');
    setNotifications((prev) => [
      ...prev,
      {
        id,
        type,
        content,
        dismissible: true,
        dismissLabel: t.dismiss,
        onDismiss: () => setNotifications((items) => items.filter((n) => n.id !== id)),
      },
    ]);
  };

  const loadFile = (file) => {
    setNotifications([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      let jsonData;
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(firstSheet);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        notify('error', t.importError);
        return;
      }

      const { participants: imported, skipped } = parseParticipantRows(jsonData);

      // Keep the current list untouched when nothing usable was found
      if (imported.length === 0) {
        notify('error', t.importNoParticipants);
        return;
      }

      if (!eventName) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setEventName(nameWithoutExt);
      }
      setParticipants(imported);
      setCurrentPageIndex(1);

      notify('success', t.importSuccess.replace('{count}', imported.length));
      if (skipped > 0) {
        notify('warning', t.importSkippedRows.replace('{count}', skipped));
      }
      const duplicates = findDuplicates(imported);
      if (duplicates.length > 0) {
        notify(
          'warning',
          t.importDuplicates
            .replace('{count}', duplicates.length)
            .replace('{names}', formatNames(duplicates))
        );
      }
    };
    reader.onerror = () => notify('error', t.importError);
    reader.readAsArrayBuffer(file);
  };

  const handleImportClick = () => {
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  // Open the confirmation dialog; by default it offers a single "Confirm" choice
  const openConfirm = (messageKey, action, choices) => {
    setConfirmModal({
      messageKey,
      choices: choices ?? [{ action, labelKey: 'confirm', primary: true }],
    });
  };

  const closeConfirm = () => {
    setConfirmModal(null);
    setPendingFile(null);
    setPendingCheckOut(null);
  };

  const handleResetClick = () => {
    openConfirm('confirmReset', null, [
      { action: 'resetCheckinOnly', labelKey: 'resetCheckinOnly' },
      { action: 'reset', labelKey: 'resetFull', primary: true },
    ]);
  };

  const handleExportClick = () => {
    openConfirm('confirmExport', 'export');
  };

  const runConfirmedAction = (action) => {
    if (action === 'import') {
      if (pendingFile) loadFile(pendingFile);
    } else if (action === 'reset') {
      setParticipants([]);
      setCurrentPageIndex(1);
      setPageSize(0);
      setEventName('');
    } else if (action === 'resetCheckinOnly') {
      setParticipants((prev) =>
        prev.map((p) => ({ ...p, checkedIn: false, checkedInAt: null, absent: false }))
      );
    } else if (action === 'export') {
      handleExport();
    } else if (action === 'uncheck') {
      if (pendingCheckOut) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === pendingCheckOut.id ? { ...p, checkedIn: false, checkedInAt: null } : p
          )
        );
      }
    }
  };

  const handleConfirmChoice = (action) => {
    runConfirmedAction(action);
    closeConfirm();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (participants.length > 0) {
      setPendingFile(file);
      openConfirm('confirmImport', 'import');
    } else {
      loadFile(file);
    }
  };

  // Handle check-in toggle
  const handleCheckIn = (participant) => {
    if (participant.absent) return;
    if (participant.checkedIn) {
      setPendingCheckOut(participant);
      openConfirm('confirmCheckOut', 'uncheck');
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id
            ? { ...p, checkedIn: true, checkedInAt: new Date().toISOString() }
            : p
        )
      );
    }
  };

  const openAddModal = () => {
    setParticipantModal({
      mode: 'add',
      data: { firstName: '', lastName: '', email: '', checkedIn: true, absent: false },
      errors: { firstName: false, lastName: false },
    });
    setTimeout(() => participantFirstNameRef.current?.focus(), 0);
  };

  const openEditModal = (participant) => {
    setParticipantModal({
      mode: 'edit',
      data: { ...participant },
      errors: { firstName: false, lastName: false },
    });
    setTimeout(() => participantFirstNameRef.current?.focus(), 0);
  };

  const closeParticipantModal = () => setParticipantModal(null);

  const handleParticipantSubmit = () => {
    const { mode, data } = participantModal;
    const errors = {
      firstName: !data.firstName.trim(),
      lastName: !data.lastName.trim(),
    };
    if (errors.firstName || errors.lastName) {
      setParticipantModal((m) => ({ ...m, errors }));
      if (errors.firstName) setTimeout(() => participantFirstNameRef.current?.focus(), 0);
      return;
    }

    if (mode === 'add') {
      const participant = {
        id: createId('manual'),
        firstName: normalizeName(data.firstName),
        lastName: normalizeName(data.lastName),
        email: data.email,
        checkedIn: data.checkedIn,
        checkedInAt: data.checkedIn ? new Date().toISOString() : null,
        absent: data.absent ?? false,
        manuallyAdded: true,
      };
      setParticipants((prev) => [...prev, participant]);
      addJustSubmittedRef.current = true;
      document.activeElement?.blur();
      setTimeout(() => {
        addJustSubmittedRef.current = false;
      }, 500);
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === data.id
            ? {
                ...p,
                firstName: normalizeName(data.firstName),
                lastName: normalizeName(data.lastName),
                email: data.email,
                checkedIn: data.checkedIn,
                checkedInAt: data.checkedIn
                  ? p.checkedIn
                    ? p.checkedInAt
                    : new Date().toISOString()
                  : null,
                absent: data.absent ?? false,
              }
            : p
        )
      );
    }
    closeParticipantModal();
  };

  // Handle export to Excel
  const handleExport = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(buildExportRows(participants, t, locale));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
      XLSX.writeFile(workbook, buildExportFileName(eventName));
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      notify('error', t.exportError);
    }
  };

  // Filter and sort participants
  const filteredParticipants = useMemo(
    () =>
      sortParticipants(
        filterParticipants(participants, { status: statusFilter.value, text: filteringText }),
        sortingColumn?.sortingField,
        isAscending
      ),
    [participants, filteringText, sortingColumn, isAscending, statusFilter]
  );

  // Paginated participants
  const paginatedParticipants = useMemo(() => {
    if (pageSize === 0) return filteredParticipants;
    const start = (currentPageIndex - 1) * pageSize;
    const end = start + pageSize;
    return filteredParticipants.slice(start, end);
  }, [filteredParticipants, currentPageIndex, pageSize]);

  // Not memoized: cells must always call the current handlers
  const columnDefinitions = (() => {
    const dim = (item, content) =>
      item.absent ? <span style={{ opacity: 0.4 }}>{content}</span> : content;
    return [
      {
        id: 'actions',
        header: '',
        cell: (item) => (
          <span style={item.absent ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
            <CheckInButton item={item} onToggle={handleCheckIn} t={t} />
          </span>
        ),
        sortingField: 'checkedIn',
        width: 160,
        minWidth: 160,
      },
      {
        id: 'lastName',
        header: t.columnLastName,
        cell: (item) =>
          dim(
            item,
            <div
              onClick={() => handleCheckIn(item)}
              style={{ cursor: item.absent ? 'default' : 'pointer' }}
            >
              {item.lastName}
            </div>
          ),
        sortingField: 'lastName',
        width: 220,
        minWidth: 150,
      },
      {
        id: 'firstName',
        header: t.columnFirstName,
        cell: (item) =>
          dim(
            item,
            <div
              onClick={() => handleCheckIn(item)}
              style={{ cursor: item.absent ? 'default' : 'pointer' }}
            >
              {item.firstName}
            </div>
          ),
        sortingField: 'firstName',
        width: 220,
        minWidth: 150,
      },
      {
        id: 'type',
        header: t.columnType,
        cell: (item) =>
          dim(
            item,
            <StatusIndicator type={item.manuallyAdded ? 'warning' : 'success'}>
              {item.manuallyAdded ? t.typeManual : t.typeRegistered}
            </StatusIndicator>
          ),
        sortingField: 'type',
        width: 140,
        minWidth: 120,
      },
      {
        id: 'checkedInAt',
        header: t.columnCheckedInAt,
        cell: (item) =>
          dim(item, item.checkedInAt ? new Date(item.checkedInAt).toLocaleString(locale) : '-'),
        sortingField: 'checkedInAt',
        width: 180,
        minWidth: 140,
      },
      {
        id: 'edit',
        header: '',
        cell: (item) => (
          <Button variant="icon" iconName="ellipsis" onClick={() => openEditModal(item)} />
        ),
        width: 50,
        minWidth: 50,
      },
    ];
  })();

  const stats = useMemo(() => computeStats(participants), [participants]);

  const chartSeries = useMemo(() => {
    const progress = computeProgressSeries(participants);
    if (!progress) return null;
    return [
      { title: t.chartExpected, type: 'line', data: progress.expected, color: '#0972d3' },
      { title: t.chartCheckedIn, type: 'line', data: progress.checkedIn, color: '#67a353' },
    ];
  }, [participants, t]);

  const languageOptions = [
    { value: 'en_US', label: 'English (US)' },
    { value: 'fr_FR', label: 'Français (FR)' },
    { value: 'es_ES', label: 'Español (ES)' },
    { value: 'it_IT', label: 'Italiano (IT)' },
    { value: 'tlh_TLH', label: 'tlhIngan Hol' },
  ];

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: t.filterAll },
      { value: 'checkedIn', label: t.filterCheckedIn },
      { value: 'notCheckedIn', label: t.filterNotCheckedIn },
      { value: 'absent', label: t.filterAbsent },
    ],
    [t]
  );

  // Label always follows the current language; only the value matters in state
  const selectedStatusOption =
    statusFilterOptions.find((o) => o.value === statusFilter.value) || statusFilterOptions[0];

  return (
    <AppLayout
      navigationHide
      notifications={<Flashbar items={notifications} />}
      splitPanelOpen={settingsOpen}
      onSplitPanelToggle={({ detail }) => setSettingsOpen(detail.open)}
      toolsHide
      splitPanelPreferences={splitPanelPreferences}
      onSplitPanelPreferencesChange={({ detail }) => setSplitPanelPreferences(detail)}
      splitPanelSize={300}
      onSplitPanelResize={({ detail }) =>
        setSplitPanelPreferences((p) => ({ ...p, size: detail.size }))
      }
      splitPanel={
        <SplitPanel header={<Header variant="h2">{t.settingsTitle}</Header>}>
          <SpaceBetween size="l">
            <FormField label={t.language}>
              <Select
                selectedOption={language}
                onChange={({ detail }) => setLanguage(detail.selectedOption)}
                options={languageOptions}
              />
            </FormField>

            <FormField label={t.darkMode}>
              <Toggle checked={darkMode} onChange={({ detail }) => setDarkMode(detail.checked)}>
                {darkMode ? t.toggleOn : t.toggleOff}
              </Toggle>
            </FormField>

            <Box textAlign="center" padding={{ top: 'xl' }}>
              <SpaceBetween direction="vertical" size="xs" alignItems="center">
                <SpaceBetween direction="horizontal" size="l" alignItems="center">
                  <Link
                    href="https://github.com/arnaduga/event-checkin-tool"
                    external={true}
                    externalIconAriaLabel="Opens in a new tab"
                    variant="primary"
                  >
                    {t.footerGithub}
                  </Link>
                  <Link
                    onFollow={(e) => {
                      e.preventDefault();
                      setShowChangelogModal(true);
                    }}
                    variant="primary"
                  >
                    v{APP_VERSION}
                  </Link>
                </SpaceBetween>
                {lastLoad && (
                  <Box variant="small" color="text-body-secondary">
                    {t.lastLoad}: {new Date(lastLoad).toLocaleString(locale)}
                  </Box>
                )}
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </SplitPanel>
      }
      contentHeader={
        <Container
          header={
            <Header
              variant="h1"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={handleImportClick} iconName="upload">
                    {t.importParticipants}
                  </Button>
                  <Button
                    onClick={handleResetClick}
                    disabled={participants.length === 0}
                    iconName="remove"
                  >
                    {t.clearTable}
                  </Button>
                  <Button
                    onClick={handleExportClick}
                    disabled={participants.length === 0}
                    variant="primary"
                    iconName="download"
                  >
                    {t.exportTable}
                  </Button>
                </SpaceBetween>
              }
            >
              <span
                onClick={() => {
                  setPendingEventName(eventName);
                  setShowEditNameModal(true);
                }}
                title={eventName ? `${t.appTitle}: ${eventName}` : undefined}
                style={{ cursor: 'pointer' }}
              >
                {(() => {
                  const full = eventName ? `${t.appTitle}: ${eventName}` : t.appTitle;
                  return full.length > 40 ? full.slice(0, 40) + '…' : full;
                })()}
              </span>
            </Header>
          }
        >
          <Box variant="awsui-key-label">
            <SpaceBetween direction="horizontal" size="xxl">
              <div>
                <Box variant="awsui-key-label">{t.statsTotal}</Box>
                <Box variant="h2">{stats.total}</Box>
              </div>
              <div>
                <Box variant="awsui-key-label">{t.statsCheckedIn}</Box>
                <Box variant="h2" color="text-status-success">
                  {stats.checkedIn}
                </Box>
              </div>
              <div>
                <Box variant="awsui-key-label">{t.statsPending}</Box>
                <Box variant="h2" color="text-status-inactive">
                  {stats.total - stats.checkedIn}
                </Box>
              </div>
              <div>
                <Box variant="awsui-key-label">{t.statsManual}</Box>
                <Box variant="h2">{stats.manual}</Box>
              </div>
            </SpaceBetween>
          </Box>
        </Container>
      }
      content={
        <SpaceBetween size="l">
          <Table
            columnDefinitions={columnDefinitions}
            items={paginatedParticipants}
            trackBy="id"
            loadingText={t.loadingParticipants}
            sortingColumn={sortingColumn}
            sortingDescending={!isAscending}
            onSortingChange={({ detail }) => {
              setSortingColumn(detail.sortingColumn);
              setIsAscending(detail.isDescending ? false : true);
            }}
            resizableColumns
            stickyHeader
            empty={
              <Box textAlign="center" color="inherit">
                <b>{t.noParticipants}</b>
                <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                  {t.noParticipantsDescription}
                </Box>
              </Box>
            }
            filter={
              <TextFilter
                filteringPlaceholder={t.searchPlaceholder}
                filteringText={filteringText}
                onChange={({ detail }) => {
                  setFilteringText(detail.filteringText);
                  setCurrentPageIndex(1);
                }}
              />
            }
            header={
              <Header
                counter={
                  participants.length > 0
                    ? `(${filteredParticipants.length}/${participants.length}) — ${t.statsCheckedIn}: ${stats.checkedIn}/${participants.length}`
                    : '(0)'
                }
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Select
                      selectedOption={selectedStatusOption}
                      onChange={({ detail }) => {
                        setStatusFilter(detail.selectedOption);
                        setCurrentPageIndex(1);
                      }}
                      options={statusFilterOptions}
                    />
                    <Button
                      onClick={() => {
                        if (!addJustSubmittedRef.current) openAddModal();
                      }}
                    >
                      {t.addParticipant}
                    </Button>
                  </SpaceBetween>
                }
              >
                {t.participantsTitle}
              </Header>
            }
            pagination={
              pageSize > 0 ? (
                <Pagination
                  currentPageIndex={currentPageIndex}
                  pagesCount={Math.ceil(filteredParticipants.length / pageSize)}
                  onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                />
              ) : undefined
            }
            preferences={
              <CollectionPreferences
                title={t.pageSize}
                confirmLabel={t.confirm}
                cancelLabel={t.cancel}
                preferences={{ pageSize }}
                onConfirm={({ detail }) => {
                  setPageSize(detail.pageSize);
                  setCurrentPageIndex(1);
                }}
                pageSizePreference={{
                  title: t.pageSize,
                  options: [
                    { value: 0, label: t.pageSizeAll },
                    { value: 10, label: `10 ${t.participants}` },
                    { value: 20, label: `20 ${t.participants}` },
                    { value: 50, label: `50 ${t.participants}` },
                    { value: 100, label: `100 ${t.participants}` },
                  ],
                }}
              />
            }
          />

          {chartSeries && (
            <Container header={<Header variant="h2">{t.chartTitle}</Header>}>
              <MixedLineBarChart
                series={chartSeries}
                xScaleType="time"
                yScaleType="linear"
                height={300}
                xTitle={t.chartXTitle}
                yTitle={t.chartYTitle}
                i18nStrings={{
                  xTickFormatter: (d) => {
                    if (!(d instanceof Date)) return d;
                    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                  },
                  yTickFormatter: (v) => String(v),
                  detailPopoverDismissAriaLabel: t.chartDismiss,
                  legendAriaLabel: t.chartLegend,
                  chartAriaRoleDescription: t.chartRoleDescription,
                }}
                hideFilter
              />
            </Container>
          )}

          <Modal
            onDismiss={closeParticipantModal}
            visible={!!participantModal}
            header={
              participantModal?.mode === 'add' ? t.addParticipantTitle : t.editParticipantTitle
            }
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={closeParticipantModal}>
                    {t.cancel}
                  </Button>
                  <Button variant="primary" onClick={handleParticipantSubmit}>
                    {participantModal?.mode === 'add' ? t.add : t.save}
                  </Button>
                </SpaceBetween>
              </Box>
            }
          >
            {participantModal && (
              <Form>
                <div
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleParticipantSubmit();
                    }
                  }}
                >
                  <SpaceBetween size="m">
                    <FormField
                      label={t.firstName}
                      constraintText={t.required}
                      errorText={participantModal.errors.firstName ? t.errorRequired : undefined}
                    >
                      <Input
                        ref={participantFirstNameRef}
                        value={participantModal.data.firstName}
                        onChange={({ detail }) => {
                          setParticipantModal((m) => ({
                            ...m,
                            data: { ...m.data, firstName: detail.value },
                            errors: {
                              ...m.errors,
                              firstName: !detail.value.trim() ? m.errors.firstName : false,
                            },
                          }));
                        }}
                        placeholder={t.placeholderFirstName}
                        invalid={participantModal.errors.firstName}
                      />
                    </FormField>
                    <FormField
                      label={t.lastName}
                      constraintText={t.required}
                      errorText={participantModal.errors.lastName ? t.errorRequired : undefined}
                    >
                      <Input
                        value={participantModal.data.lastName}
                        onChange={({ detail }) => {
                          setParticipantModal((m) => ({
                            ...m,
                            data: { ...m.data, lastName: detail.value },
                            errors: {
                              ...m.errors,
                              lastName: !detail.value.trim() ? m.errors.lastName : false,
                            },
                          }));
                        }}
                        placeholder={t.placeholderLastName}
                        invalid={participantModal.errors.lastName}
                      />
                    </FormField>
                    <FormField label={t.email}>
                      <Input
                        value={participantModal.data.email}
                        onChange={({ detail }) =>
                          setParticipantModal((m) => ({
                            ...m,
                            data: { ...m.data, email: detail.value },
                          }))
                        }
                        placeholder={t.placeholderEmail}
                        type="email"
                      />
                    </FormField>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <FormField label={t.autoCheckIn}>
                        <Toggle
                          checked={participantModal.data.checkedIn}
                          onChange={({ detail }) =>
                            setParticipantModal((m) => ({
                              ...m,
                              data: { ...m.data, checkedIn: detail.checked },
                            }))
                          }
                        >
                          {participantModal.data.checkedIn
                            ? t.statusCheckedIn
                            : t.statusNotCheckedIn}
                        </Toggle>
                      </FormField>
                      <FormField label={t.absent}>
                        <Toggle
                          checked={participantModal.data.absent ?? false}
                          onChange={({ detail }) =>
                            setParticipantModal((m) => ({
                              ...m,
                              data: { ...m.data, absent: detail.checked },
                            }))
                          }
                        >
                          {participantModal.data.absent ? t.absent : '–'}
                        </Toggle>
                      </FormField>
                    </div>
                  </SpaceBetween>
                </div>
              </Form>
            )}
          </Modal>

          <Modal
            onDismiss={() => setShowChangelogModal(false)}
            visible={showChangelogModal}
            size="large"
            header="Changelog"
          >
            <Box padding={{ vertical: 's' }}>
              <ReactMarkdown
                components={{
                  h3: ({ children }) => {
                    const text = String(children).toLowerCase();
                    const [bg, fg] = text.includes('added')
                      ? ['#d4edda', '#1a5c2a']
                      : text.includes('changed')
                        ? ['#d0e8ff', '#0a4a8a']
                        : text.includes('fixed')
                          ? ['#fde8d0', '#7a3010']
                          : text.includes('removed')
                            ? ['#fdd', '#8b0000']
                            : text.includes('deprecated')
                              ? ['#fff3cd', '#6b4c00']
                              : ['#e8e8e8', '#333'];
                    return (
                      <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                        <span
                          style={{
                            backgroundColor: bg,
                            color: fg,
                            borderRadius: '12px',
                            padding: '2px 10px',
                            fontSize: '0.8em',
                            fontWeight: 'bold',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {children}
                        </span>
                      </div>
                    );
                  },
                }}
              >
                {changelog}
              </ReactMarkdown>
            </Box>
          </Modal>

          <Modal
            onDismiss={closeConfirm}
            visible={!!confirmModal}
            header={t.confirm}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={closeConfirm}>
                    {t.cancel}
                  </Button>
                  {confirmModal?.choices.map((choice) => (
                    <Button
                      key={choice.action}
                      variant={choice.primary ? 'primary' : 'normal'}
                      onClick={() => handleConfirmChoice(choice.action)}
                    >
                      {t[choice.labelKey]}
                    </Button>
                  ))}
                </SpaceBetween>
              </Box>
            }
          >
            {confirmModal?.messageKey === 'confirmCheckOut' && pendingCheckOut ? (
              <span>
                {t.confirmCheckOutPrefix}
                <b>
                  {pendingCheckOut.firstName} {pendingCheckOut.lastName}
                </b>
                {t.confirmCheckOutSuffix}
              </span>
            ) : (
              confirmModal && t[confirmModal.messageKey]
            )}
          </Modal>

          <Modal
            onDismiss={() => setShowEditNameModal(false)}
            visible={showEditNameModal}
            header={t.eventName}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={() => setShowEditNameModal(false)}>
                    {t.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEventName(pendingEventName);
                      setShowEditNameModal(false);
                    }}
                  >
                    {t.confirm}
                  </Button>
                </SpaceBetween>
              </Box>
            }
          >
            <FormField label={t.eventName} description={t.eventNameDescription}>
              <Input
                ref={editNameInputRef}
                value={pendingEventName}
                onChange={({ detail }) => setPendingEventName(detail.value)}
                placeholder={t.placeholderEventName}
                onKeyDown={({ detail }) => {
                  if (detail.key === 'Enter') {
                    setEventName(pendingEventName);
                    setShowEditNameModal(false);
                  }
                }}
              />
            </FormField>
          </Modal>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </SpaceBetween>
      }
      contentType="default"
    />
  );
}

export default App;
