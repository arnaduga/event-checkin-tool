import React, { useState, useEffect, useMemo, useRef } from 'react';
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
} from '@cloudscape-design/components';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import { translations } from './translations';
import { changelog } from './changelog';
import packageJson from '../package.json';

const STORAGE_KEY = 'event-checkin-participants';
const SETTINGS_KEY = 'event-checkin-settings';
const LAST_LOAD_KEY = 'event-checkin-last-load';
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
  const [participants, setParticipants] = useState([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [sortingColumn, setSortingColumn] = useState({ sortingField: 'lastName' });
  const [isAscending, setIsAscending] = useState(true);
  const [participantModal, setParticipantModal] = useState(null); // null | { mode: 'add'|'edit', data: {...}, errors: {...} }
  const fileInputRef = useRef(null);
  const editNameInputRef = useRef(null);
  const participantFirstNameRef = useRef(null);
  const addJustSubmittedRef = useRef(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingCheckOut, setPendingCheckOut] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, message: '' });
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [pendingEventName, setPendingEventName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [splitPanelPreferences, setSplitPanelPreferences] = useState({
    position: 'side'
  });

  // Detect system dark mode preference
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Settings state with system defaults
  const [language, setLanguage] = useState({ value: 'fr_FR', label: 'Français (FR)' });
  const [darkMode, setDarkMode] = useState(systemPrefersDark);
  const [eventName, setEventName] = useState('');

  const [statusFilter, setStatusFilter] = useState({ value: 'all', label: 'All' });

  // Get translations
  const t = translations[language.value];

  const [lastLoad, setLastLoad] = useState(() => localStorage.getItem(LAST_LOAD_KEY));

  // Record load timestamp on every page load
  useEffect(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_LOAD_KEY, now);
    setLastLoad(now);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    // Load participants
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setParticipants(parsed);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }

    // Load settings
    const settingsStored = localStorage.getItem(SETTINGS_KEY);
    if (settingsStored) {
      try {
        const settings = JSON.parse(settingsStored);
        if (settings.language) {
          setLanguage(settings.language);
        }
        if (settings.darkMode !== undefined) {
          setDarkMode(settings.darkMode);
        }
        if (settings.eventName) {
          setEventName(settings.eventName);
        }
        if (settings.pageSize !== undefined) {
          setPageSize(settings.pageSize);
        }
        if (settings.statusFilter) {
          setStatusFilter(settings.statusFilter);
        }
        if (settings.splitPanelPreferences) {
          setSplitPanelPreferences(settings.splitPanelPreferences);
        }

      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    // Mark initial mount as complete
    setIsInitialMount(false);
  }, []);

  // Save to localStorage whenever participants change
  useEffect(() => {
    if (participants.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
    }
  }, [participants]);

  // Save settings to localStorage (skip on initial mount)
  useEffect(() => {
    if (!isInitialMount) {
      const settings = {
        language,
        darkMode,
        eventName,

        pageSize,
        statusFilter,
        splitPanelPreferences,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [language, darkMode, eventName, pageSize, statusFilter, splitPanelPreferences, isInitialMount]);

  // Apply dark mode
  useEffect(() => {
    applyMode(darkMode ? Mode.Dark : Mode.Light);
  }, [darkMode]);

  // Update statusFilter label when language changes
  useEffect(() => {
    const filterMap = {
      'all': t.filterAll,
      'checkedIn': t.filterCheckedIn,
      'notCheckedIn': t.filterNotCheckedIn,
      'absent': t.filterAbsent,
    };
    if (filterMap[statusFilter.value]) {
      setStatusFilter({ value: statusFilter.value, label: filterMap[statusFilter.value] });
    }
  }, [language]);

  useEffect(() => {
    if (showEditNameModal) {
      setTimeout(() => editNameInputRef.current?.focus(), 50);
    }
  }, [showEditNameModal]);


  // Normalize name: capitalize first letter, lowercase rest
  const normalizeName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed.length === 0) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const loadFile = (file) => {
    if (!eventName) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setEventName(nameWithoutExt);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const transformedData = jsonData.map((row, index) => ({
          id: `participant-${index}-${Date.now()}`,
          firstName: normalizeName(row['Prénom'] || row['First Name'] || row['Prenom'] || row['prénom'] || ''),
          lastName: normalizeName(row['Nom'] || row['Last Name'] || row['nom'] || ''),
          email: row['Email'] || row['email'] || '',
          checkedIn: false,
          checkedInAt: null,
          absent: false,
          manuallyAdded: false,
        }));
        setParticipants(transformedData);
        setCurrentPageIndex(1);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportClick = () => {
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleResetClick = () => {
    setConfirmModal({ visible: true, action: 'reset', message: t.confirmReset });
  };

  const handleExportClick = () => {
    setConfirmModal({ visible: true, action: 'export', message: t.confirmExport });
  };

  const handleConfirm_action = (action) => {
    if (action === 'import') {
      loadFile(pendingFile);
      setPendingFile(null);
    } else if (action === 'reset') {
      setParticipants([]);
      setCurrentPageIndex(1);
      setPageSize(0);
      setEventName('');
      localStorage.removeItem(STORAGE_KEY);
    } else if (action === 'resetCheckinOnly') {
      setParticipants((prev) => prev.map((p) => ({ ...p, checkedIn: false, checkedInAt: null })));
    } else if (action === 'export') {
      handleExport();
    } else if (action === 'uncheck') {
      if (pendingCheckOut) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === pendingCheckOut.id
              ? { ...p, checkedIn: false, checkedInAt: null }
              : p
          )
        );
        setPendingCheckOut(null);
      }
    }
  };

  const handleConfirm = () => {
    const action = confirmModal.action;
    setConfirmModal({ visible: false, action: null, message: '' });
    handleConfirm_action(action);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (participants.length > 0) {
      setPendingFile(file);
      setConfirmModal({ visible: true, action: 'import', message: t.confirmImport });
    } else {
      loadFile(file);
    }
  };

  // Handle check-in toggle
  const handleCheckIn = (participant) => {
    if (participant.checkedIn) {
      setPendingCheckOut(participant);
      setConfirmModal({ visible: true, action: 'uncheck', message: t.confirmCheckOut });
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
      data: { firstName: '', lastName: '', email: '', checkedIn: autoCheckIn, absent: false },
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
        id: `manual-${Date.now()}`,
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
      setTimeout(() => { addJustSubmittedRef.current = false; }, 500);
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
                  ? (p.checkedIn ? p.checkedInAt : new Date().toISOString())
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
      const exportLocale = language.value === 'tlh_TLH' ? 'fr-FR' : language.value.replace('_', '-');
      const exportData = participants.map((p) => ({
        [t.columnFirstName]: p.firstName,
        [t.columnLastName]: p.lastName,
        [t.columnEmail]: p.email,
        [t.columnType]: p.manuallyAdded ? t.typeManual : t.typeRegistered,
        [t.columnStatus]: p.checkedIn ? t.statusCheckedIn : t.statusNotCheckedIn,
        [t.columnCheckedInAt]: p.checkedInAt
          ? new Date(p.checkedInAt).toLocaleString(exportLocale)
          : '-',
        [t.columnAbsent]: p.absent ? t.absent : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

      // Generate file name
      const timestamp = new Date().toISOString().split('T')[0];
      const eventPrefix = eventName ? `${eventName.replace(/[^a-z0-9]/gi, '_')}_` : '';
      const fileName = `${eventPrefix}participants_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting file. Please try again.');
    }
  };

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Apply status filter
    if (statusFilter.value === 'checkedIn') {
      filtered = filtered.filter((p) => p.checkedIn);
    } else if (statusFilter.value === 'notCheckedIn') {
      filtered = filtered.filter((p) => !p.checkedIn);
    } else if (statusFilter.value === 'absent') {
      filtered = filtered.filter((p) => p.absent);
    }

    // Apply text filter
    if (filteringText) {
      const lowerFilter = filteringText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(lowerFilter) ||
          p.lastName.toLowerCase().includes(lowerFilter) ||
          p.email.toLowerCase().includes(lowerFilter)
      );
    }

    // Apply sorting
    if (sortingColumn && sortingColumn.sortingField) {
      filtered = [...filtered].sort((a, b) => {
        const field = sortingColumn.sortingField;
        let aVal = a[field] || '';
        let bVal = b[field] || '';

        // Handle special cases
        if (field === 'checkedIn') {
          aVal = a.checkedIn ? 1 : 0;
          bVal = b.checkedIn ? 1 : 0;
        } else if (field === 'type') {
          aVal = a.manuallyAdded ? 1 : 0;
          bVal = b.manuallyAdded ? 1 : 0;
        } else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }

        if (aVal < bVal) return isAscending ? -1 : 1;
        if (aVal > bVal) return isAscending ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [participants, filteringText, sortingColumn, isAscending, statusFilter]);

  // Paginated participants
  const paginatedParticipants = useMemo(() => {
    if (pageSize === 0) return filteredParticipants;
    const start = (currentPageIndex - 1) * pageSize;
    const end = start + pageSize;
    return filteredParticipants.slice(start, end);
  }, [filteredParticipants, currentPageIndex, pageSize]);

  const columnDefinitions = useMemo(() => {
    const locale = language.value === 'tlh_TLH' ? 'fr-FR' : language.value.replace('_', '-');
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
        cell: (item) => dim(item,
          <div onClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
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
        cell: (item) => dim(item,
          <div onClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
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
        cell: (item) => dim(item,
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
        cell: (item) => dim(item,
          item.checkedInAt ? new Date(item.checkedInAt).toLocaleString(locale) : '-'
        ),
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
  }, [t, language]);

  const stats = useMemo(() => {
    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checkedIn).length;
    const manual = participants.filter((p) => p.manuallyAdded).length;
    return { total, checkedIn, manual };
  }, [participants]);

  const chartSeries = useMemo(() => {
    if (participants.length === 0) return null;

    const checkedInTimes = participants
      .filter((p) => p.checkedIn && p.checkedInAt)
      .map((p) => new Date(p.checkedInAt).getTime())
      .sort((a, b) => a - b);

    if (checkedInTimes.length === 0) return null;

    const startTime = checkedInTimes[0];
    const endTime = checkedInTimes[checkedInTimes.length - 1];

    const totalAtStart = participants.filter((p) => !p.manuallyAdded).length;
    const manualWithoutTime = participants.filter((p) => p.manuallyAdded && !p.checkedInAt).length;
    const manualAdditions = participants
      .filter((p) => p.manuallyAdded && p.checkedInAt)
      .map((p) => new Date(p.checkedInAt).getTime())
      .sort((a, b) => a - b);

    let expectedRaw = [];
    let runningTotal = totalAtStart + manualWithoutTime;
    expectedRaw.push({ x: new Date(startTime), y: runningTotal });
    for (const ts of manualAdditions) {
      if (ts >= startTime) {
        runningTotal += 1;
        expectedRaw.push({ x: new Date(ts), y: runningTotal });
      }
    }
    if (endTime > startTime) {
      expectedRaw.push({ x: new Date(endTime), y: runningTotal });
    }

    const checkedInRaw = checkedInTimes.map((ts, i) => ({ x: new Date(ts), y: i + 1 }));

    return [
      {
        title: t.chartExpected,
        type: 'line',
        data: expectedRaw,
        color: '#0972d3',
      },
      {
        title: t.chartCheckedIn,
        type: 'line',
        data: checkedInRaw,
        color: '#67a353',
      },
    ];
  }, [participants, t]);

  const languageOptions = [
    { value: 'en_US', label: 'English (US)' },
    { value: 'fr_FR', label: 'Français (FR)' },
    { value: 'es_ES', label: 'Español (ES)' },
    { value: 'it_IT', label: 'Italiano (IT)' },
    { value: 'tlh_TLH', label: 'tlhIngan Hol' },
  ];

  const statusFilterOptions = useMemo(() => [
    { value: 'all', label: t.filterAll },
    { value: 'checkedIn', label: t.filterCheckedIn },
    { value: 'notCheckedIn', label: t.filterNotCheckedIn },
    { value: 'absent', label: t.filterAbsent },
  ], [t]);

  return (
    <AppLayout
      navigationHide
      splitPanelOpen={settingsOpen}
      onSplitPanelToggle={({ detail }) => setSettingsOpen(detail.open)}
      toolsHide
      splitPanelPreferences={splitPanelPreferences}
      onSplitPanelPreferencesChange={({ detail }) => setSplitPanelPreferences(detail)}
      splitPanelSize={300}
      onSplitPanelResize={({ detail }) => setSplitPanelPreferences((p) => ({ ...p, size: detail.size }))}
      splitPanel={
        <SplitPanel
          header={<Header variant="h2">{t.settingsTitle}</Header>}
        >
          <SpaceBetween size="l">
            <FormField label={t.language}>
              <Select
                selectedOption={language}
                onChange={({ detail }) => setLanguage(detail.selectedOption)}
                options={languageOptions}
              />
            </FormField>

            <FormField label={t.darkMode}>
              <Toggle
                checked={darkMode}
                onChange={({ detail }) => setDarkMode(detail.checked)}
              >
                {darkMode ? 'On' : 'Off'}
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
                  >{t.footerGithub}</Link>
                  <Link
                    onFollow={(e) => {
                      e.preventDefault();
                      setShowChangelogModal(true);
                    }}
                    variant="primary"
                  >v{APP_VERSION}</Link>
                </SpaceBetween>
                {lastLoad && (
                  <Box variant="small" color="text-body-secondary">
                    {t.lastLoad}: {new Date(lastLoad).toLocaleString(language.value === 'tlh_TLH' ? 'fr-FR' : language.value.replace('_', '-'))}
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
                onClick={() => { setPendingEventName(eventName); setShowEditNameModal(true); }}
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
            loadingText="Loading participants"
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
                      selectedOption={statusFilter}
                      onChange={({ detail }) => {
                        setStatusFilter(detail.selectedOption);
                        setCurrentPageIndex(1);
                      }}
                      options={statusFilterOptions}
                    />
                    <Button onClick={() => { if (!addJustSubmittedRef.current) openAddModal(); }}>
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
                  onChange={({ detail }) =>
                    setCurrentPageIndex(detail.currentPageIndex)
                  }
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
            <Container
              header={<Header variant="h2">{t.chartTitle}</Header>}
            >
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
                    const locale = language.value === 'tlh_TLH' ? 'fr-FR' : language.value.replace('_', '-');
                    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                  },
                  yTickFormatter: (v) => String(v),
                  detailPopoverDismissAriaLabel: 'Close',
                  legendAriaLabel: 'Legend',
                  chartAriaRoleDescription: 'line chart',
                }}
                hideFilter
              />
            </Container>
          )}

          <Modal
            onDismiss={closeParticipantModal}
            visible={!!participantModal}
            header={participantModal?.mode === 'add' ? t.addParticipantTitle : t.editParticipantTitle}
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
                <div onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleParticipantSubmit(); } }}>
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
                          setParticipantModal((m) => ({ ...m, data: { ...m.data, firstName: detail.value }, errors: { ...m.errors, firstName: !detail.value.trim() ? m.errors.firstName : false } }));
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
                          setParticipantModal((m) => ({ ...m, data: { ...m.data, lastName: detail.value }, errors: { ...m.errors, lastName: !detail.value.trim() ? m.errors.lastName : false } }));
                        }}
                        placeholder={t.placeholderLastName}
                        invalid={participantModal.errors.lastName}
                      />
                    </FormField>
                    <FormField label={t.email}>
                      <Input
                        value={participantModal.data.email}
                        onChange={({ detail }) =>
                          setParticipantModal((m) => ({ ...m, data: { ...m.data, email: detail.value } }))
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
                            setParticipantModal((m) => ({ ...m, data: { ...m.data, checkedIn: detail.checked } }))
                          }
                        >
                          {participantModal.data.checkedIn ? t.statusCheckedIn : t.statusNotCheckedIn}
                        </Toggle>
                      </FormField>
                      <FormField label={t.absent}>
                        <Toggle
                          checked={participantModal.data.absent ?? false}
                          onChange={({ detail }) =>
                            setParticipantModal((m) => ({ ...m, data: { ...m.data, absent: detail.checked } }))
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
              <ReactMarkdown components={{
                h3: ({ children }) => {
                  const text = String(children).toLowerCase();
                  const [bg, fg] =
                    text.includes('added')      ? ['#d4edda', '#1a5c2a'] :
                    text.includes('changed')    ? ['#d0e8ff', '#0a4a8a'] :
                    text.includes('fixed')      ? ['#fde8d0', '#7a3010'] :
                    text.includes('removed')    ? ['#fdd', '#8b0000'] :
                    text.includes('deprecated') ? ['#fff3cd', '#6b4c00'] :
                    ['#e8e8e8', '#333'];
                  return (
                    <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                      <span style={{
                        backgroundColor: bg,
                        color: fg,
                        borderRadius: '12px',
                        padding: '2px 10px',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}>{children}</span>
                    </div>
                  );
                }
              }}>{changelog}</ReactMarkdown>
            </Box>
          </Modal>

          <Modal
            onDismiss={() => setConfirmModal({ visible: false, action: null, message: '' })}
            visible={confirmModal.visible}
            header={t.confirm}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    variant="link"
                    onClick={() => setConfirmModal({ visible: false, action: null, message: '' })}
                  >
                    {t.cancel}
                  </Button>
                  {confirmModal.action === 'reset' ? (
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        onClick={() => {
                          setConfirmModal({ visible: false, action: null, message: '' });
                          handleConfirm_action('resetCheckinOnly');
                        }}
                      >
                        {t.resetCheckinOnly}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setConfirmModal({ visible: false, action: null, message: '' });
                          handleConfirm_action('reset');
                        }}
                      >
                        {t.resetFull}
                      </Button>
                    </SpaceBetween>
                  ) : (
                    <Button variant="primary" onClick={handleConfirm}>
                      {t.confirm}
                    </Button>
                  )}
                </SpaceBetween>
              </Box>
            }
          >
            {confirmModal.action === 'uncheck' && pendingCheckOut
              ? <span>{t.confirmCheckOutPrefix}<b>{pendingCheckOut.firstName} {pendingCheckOut.lastName}</b>{t.confirmCheckOutSuffix}</span>
              : confirmModal.message}
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
