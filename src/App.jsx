import React, { useState, useEffect, useMemo } from 'react';
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
  CollectionPreferences,
  FormField,
  Input,
  Modal,
  Form,
  StatusIndicator,
  FileUpload,
  Select,
  Toggle,
  Link,
  HelpPanel,
  SplitPanel,
} from '@cloudscape-design/components';
import { applyMode, Mode } from '@cloudscape-design/global-styles';
import { translations } from './translations';
import { changelog } from './changelog';

const STORAGE_KEY = 'event-checkin-participants';
const SETTINGS_KEY = 'event-checkin-settings';
const APP_VERSION = '1.0.0';

function App() {
  const [participants, setParticipants] = useState([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortingColumn, setSortingColumn] = useState({ sortingField: 'lastName' });
  const [isAscending, setIsAscending] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [fileValue, setFileValue] = useState([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [splitPanelOpen, setSplitPanelOpen] = useState(false);
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
    };
    if (filterMap[statusFilter.value]) {
      setStatusFilter({ value: statusFilter.value, label: filterMap[statusFilter.value] });
    }
  }, [language]);

  // Normalize name: capitalize first letter, lowercase rest
  const normalizeName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed.length === 0) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  // Handle Excel file upload
  const handleFileUpload = (detail) => {
    const files = detail.value;
    setFileValue(files);

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Transform data and add check-in status
          const transformedData = jsonData.map((row, index) => ({
            id: `participant-${index}-${Date.now()}`,
            firstName: normalizeName(row['Prénom'] || row['First Name'] || row['Prenom'] || row['prénom'] || ''),
            lastName: normalizeName(row['Nom'] || row['Last Name'] || row['nom'] || ''),
            email: row['Email'] || row['email'] || '',
            checkedIn: false,
            checkedInAt: null,
            manuallyAdded: false,
          }));

          setParticipants(transformedData);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          alert('Error reading Excel file. Please check the file format.');
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Handle check-in toggle
  const handleCheckIn = (participant) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participant.id
          ? {
              ...p,
              checkedIn: !p.checkedIn,
              checkedInAt: !p.checkedIn ? new Date().toISOString() : null,
            }
          : p
      )
    );
  };

  // Handle manual participant addition
  const handleAddParticipant = () => {
    if (!newParticipant.firstName || !newParticipant.lastName) {
      alert(t.required);
      return;
    }

    const participant = {
      id: `manual-${Date.now()}`,
      firstName: normalizeName(newParticipant.firstName),
      lastName: normalizeName(newParticipant.lastName),
      email: newParticipant.email,
      checkedIn: autoCheckIn,
      checkedInAt: autoCheckIn ? new Date().toISOString() : null,
      manuallyAdded: true,
    };

    setParticipants((prev) => [...prev, participant]);
    setNewParticipant({ firstName: '', lastName: '', email: '' });
    setShowAddModal(false);
  };

  // Handle export to Excel
  const handleExport = () => {
    const exportData = participants.map((p) => ({
      [t.columnFirstName]: p.firstName,
      [t.columnLastName]: p.lastName,
      [t.columnEmail]: p.email,
      [t.columnStatus]: p.checkedIn ? t.statusCheckedIn : t.statusNotCheckedIn,
      [t.columnCheckedInAt]: p.checkedInAt
        ? new Date(p.checkedInAt).toLocaleString(language.value.replace('_', '-'))
        : '-',
      [t.columnType]: p.manuallyAdded ? t.typeManual : t.typeRegistered,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    const timestamp = new Date().toISOString().split('T')[0];
    const eventPrefix = eventName ? `${eventName.replace(/[^a-z0-9]/gi, '_')}_` : '';
    XLSX.writeFile(workbook, `${eventPrefix}participants_${timestamp}.xlsx`);
  };

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Apply status filter
    if (statusFilter.value === 'checkedIn') {
      filtered = filtered.filter((p) => p.checkedIn);
    } else if (statusFilter.value === 'notCheckedIn') {
      filtered = filtered.filter((p) => !p.checkedIn);
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
    const start = (currentPageIndex - 1) * pageSize;
    const end = start + pageSize;
    return filteredParticipants.slice(start, end);
  }, [filteredParticipants, currentPageIndex, pageSize]);

  const columnDefinitions = useMemo(() => [
    {
      id: 'actions',
      header: '',
      cell: (item) => (
        <Box title={item.checkedIn ? t.checkOut : t.checkIn}>
          <Toggle
            checked={item.checkedIn}
            onChange={() => handleCheckIn(item)}
          />
        </Box>
      ),
      sortingField: 'checkedIn',
      width: 50,
      minWidth: 50,
    },
    {
      id: 'lastName',
      header: t.columnLastName,
      cell: (item) => (
        <div onDoubleClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
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
      cell: (item) => (
        <div onDoubleClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
          {item.firstName}
        </div>
      ),
      sortingField: 'firstName',
      width: 220,
      minWidth: 150,
    },
    {
      id: 'email',
      header: t.columnEmail,
      cell: (item) => (
        <div onDoubleClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
          {item.email}
        </div>
      ),
      sortingField: 'email',
      width: 280,
      minWidth: 180,
    },
    {
      id: 'type',
      header: t.columnType,
      cell: (item) => (
        <div onDoubleClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
          {item.manuallyAdded ? t.typeManual : t.typeRegistered}
        </div>
      ),
      sortingField: 'type',
      width: 120,
      minWidth: 100,
    },
    {
      id: 'checkedInAt',
      header: t.columnCheckedInAt,
      cell: (item) => (
        <div onDoubleClick={() => handleCheckIn(item)} style={{ cursor: 'pointer' }}>
          {item.checkedInAt
            ? new Date(item.checkedInAt).toLocaleString(language.value.replace('_', '-'))
            : '-'}
        </div>
      ),
      sortingField: 'checkedInAt',
      width: 180,
      minWidth: 150,
    },
  ], [t, language]);

  const stats = useMemo(() => {
    const total = participants.length;
    const checkedIn = participants.filter((p) => p.checkedIn).length;
    const manual = participants.filter((p) => p.manuallyAdded).length;
    return { total, checkedIn, manual };
  }, [participants]);

  const languageOptions = [
    { value: 'en_US', label: 'English (US)' },
    { value: 'fr_FR', label: 'Français (FR)' },
  ];

  const statusFilterOptions = useMemo(() => [
    { value: 'all', label: t.filterAll },
    { value: 'checkedIn', label: t.filterCheckedIn },
    { value: 'notCheckedIn', label: t.filterNotCheckedIn },
  ], [t]);

  return (
    <AppLayout
      navigationHide
      splitPanelOpen={toolsOpen}
      onSplitPanelToggle={({ detail }) => setToolsOpen(detail.open)}
      toolsOpen={splitPanelOpen}
      onToolsChange={({ detail }) => setSplitPanelOpen(detail.open)}
      splitPanelPreferences={splitPanelPreferences}
      onSplitPanelPreferencesChange={({ detail }) => setSplitPanelPreferences(detail)}
      splitPanelSize={300}
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
            </Box>
          </SpaceBetween>
        </SplitPanel>
      }
      tools={
        <HelpPanel header={t.fileUpload}>
          <SpaceBetween size="l">
            <FormField
              label={t.eventName}
              description={t.eventNameDescription}
            >
              <Input
                value={eventName}
                onChange={({ detail }) => setEventName(detail.value)}
                placeholder={t.placeholderEventName}
              />
            </FormField>

            <FormField
              label={t.uploadTitle}
              description={t.uploadDescription}
            >
              <FileUpload
                onChange={({ detail }) => handleFileUpload(detail)}
                value={fileValue}
                i18nStrings={{
                  uploadButtonText: (e) =>
                    e ? t.uploadButton + 's' : t.uploadButton,
                  dropzoneText: (e) =>
                    e
                      ? t.dropzoneText + 's'
                      : t.dropzoneText,
                  removeFileAriaLabel: (e) =>
                    `${t.removeFile} ${e + 1}`,
                  limitShowFewer: 'Show fewer files',
                  limitShowMore: 'Show more files',
                  errorIconAriaLabel: 'Error',
                }}
                showFileLastModified
                showFileSize
                showFileThumbnail
                tokenLimit={3}
                constraintText={t.constraintText}
                accept=".xlsx,.xls"
              />
            </FormField>

            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={() => {
                  setParticipants([]);
                  setFileValue([]);
                  setEventName('');
                  localStorage.removeItem(STORAGE_KEY);
                }}
                disabled={participants.length === 0}
              >
                {t.clearTable}
              </Button>

              <Button
                onClick={handleExport}
                disabled={participants.length === 0}
                variant="primary"
              >
                {t.exportTable}
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </HelpPanel>
      }
      content={
        <SpaceBetween size="l">
          <Container
            header={
              <Header
                variant="h1"
                description={t.appDescription}
              >
                {eventName ? `${t.appTitle}: ${eventName}` : t.appTitle}
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

          <Table
            columnDefinitions={columnDefinitions}
            items={paginatedParticipants}
            loadingText="Loading participants"
            sortingColumn={sortingColumn}
            sortingDescending={!isAscending}
            onSortingChange={({ detail }) => {
              setSortingColumn(detail.sortingColumn);
              setIsAscending(detail.isDescending ? false : true);
            }}
            resizableColumns
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
                    ? `(${filteredParticipants.length}/${participants.length})`
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
                    <Button onClick={() => setShowAddModal(true)}>
                      {t.addParticipant}
                    </Button>
                  </SpaceBetween>
                }
              >
                {t.participantsTitle}
              </Header>
            }
            pagination={
              <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={Math.ceil(filteredParticipants.length / pageSize)}
                onChange={({ detail }) =>
                  setCurrentPageIndex(detail.currentPageIndex)
                }
              />
            }
            preferences={
              <CollectionPreferences
                title={t.preferencesTitle}
                confirmLabel={t.confirm}
                cancelLabel={t.cancel}
                preferences={{
                  pageSize: pageSize,
                }}
                pageSizePreference={{
                  title: t.pageSize,
                  options: [
                    { value: 10, label: `10 ${t.participants}` },
                    { value: 20, label: `20 ${t.participants}` },
                    { value: 50, label: `50 ${t.participants}` },
                    { value: 100, label: `100 ${t.participants}` },
                  ],
                }}
                onConfirm={({ detail }) => {
                  setPageSize(detail.pageSize);
                  setCurrentPageIndex(1);
                }}
              />
            }
          />

          <Modal
            onDismiss={() => setShowAddModal(false)}
            visible={showAddModal}
            header={t.addParticipantTitle}
            footer={
              <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="link" onClick={() => setShowAddModal(false)}>
                    {t.cancel}
                  </Button>
                  <Button variant="primary" onClick={handleAddParticipant}>
                    {t.add}
                  </Button>
                </SpaceBetween>
              </Box>
            }
          >
            <Form>
              <SpaceBetween size="m">
                <FormField label={t.firstName} constraintText={t.required}>
                  <Input
                    value={newParticipant.firstName}
                    onChange={({ detail }) =>
                      setNewParticipant({ ...newParticipant, firstName: detail.value })
                    }
                    placeholder={t.placeholderFirstName}
                  />
                </FormField>
                <FormField label={t.lastName} constraintText={t.required}>
                  <Input
                    value={newParticipant.lastName}
                    onChange={({ detail }) =>
                      setNewParticipant({ ...newParticipant, lastName: detail.value })
                    }
                    placeholder={t.placeholderLastName}
                  />
                </FormField>
                <FormField label={t.email}>
                  <Input
                    value={newParticipant.email}
                    onChange={({ detail }) =>
                      setNewParticipant({ ...newParticipant, email: detail.value })
                    }
                    placeholder={t.placeholderEmail}
                    type="email"
                  />
                </FormField>
                <FormField label={t.autoCheckIn}>
                  <Toggle
                    checked={autoCheckIn}
                    onChange={({ detail }) => setAutoCheckIn(detail.checked)}
                  >
                    {autoCheckIn ? t.checkInImmediately : t.dontCheckIn}
                  </Toggle>
                </FormField>
              </SpaceBetween>
            </Form>
          </Modal>

          <Modal
            onDismiss={() => setShowChangelogModal(false)}
            visible={showChangelogModal}
            size="large"
            header="Changelog"
          >
            <Box padding={{ vertical: 's' }}>
              <ReactMarkdown>{changelog}</ReactMarkdown>
            </Box>
          </Modal>
        </SpaceBetween>
      }
      contentType="default"
    />
  );
}

export default App;
