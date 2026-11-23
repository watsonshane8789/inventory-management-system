

import { useMemo, useState, type CSSProperties } from 'react';
import type { Requirement, TestCase } from '@step/contracts';
import { useCampaignDraft } from '../context/use_campaign_draft';
import { CampaignBuilderView } from './campaign_builder_view';
import './requirements_view.css';

// ---------------------------------------------------------------------------------------------------------
// POC types + dummy data
//
// NOTE: No API calls are made in this view. Everything below is dummy data shaped like the response we
// expect from the backend (see the "expected backend response" document). When the real endpoints exist,
// replace the FOLDERS constant with react-query hooks and keep the rest of the component as is.
// ---------------------------------------------------------------------------------------------------------

type RequirementStatus = Requirement['status'];
type TestCaseItem = Pick<TestCase, 'id' | 'name' | 'status'>;

/** Requirement as the UI needs it: the contract `Requirement` plus the linked test cases for the expanded row. */
interface RequirementItem extends Requirement {
    testCases: TestCaseItem[];
}

interface RequirementFolder {
    id: string;
    name: string;
    description: string;
    owner: string;
    updatedAt: string;
    /** Requirements that live directly in this folder (not in a sub folder). */
    requirements: RequirementItem[];
    children: RequirementFolder[];
}

type DetailTab = 'requirements' | 'details';
type ViewMode = 'list' | 'grid';

const PAGE_SIZE = 5;
const DEFAULT_FOLDER_ID = 'vehicle-safety';
const STATUS_OPTIONS: RequirementStatus[] = [
    'New',
    'in Progress',
    'implemented',
    'Re-evaluation',
    'rejected',
    'Obsolete',
    'None',
];

function tc(id: string, name: string, status: TestCaseItem['status']): TestCaseItem {
    return { id, name, status };
}

function req(
    id: string,
    name: string,
    status: RequirementStatus,
    testCases: TestCaseItem[] = [],
): RequirementItem {
    return { id, name, status, testCases, testCaseIds: testCases.map((testCase) => testCase.id) };
}

const FOLDERS: RequirementFolder[] = [
    {
        id: 'vehicle-safety',
        name: 'Vehicle Safety Requirements',
        description: 'Contains requirements related to vehicle safety and compliance.',
        owner: 'ADAS Safety Team',
        updatedAt: '2026-11-18T09:30:00Z',
        requirements: [],
        children: [
            {
                id: 'safety-systems',
                name: 'Safety Systems',
                description: 'Active safety functions such as braking, warning and lane keeping.',
                owner: 'ADAS Safety Team',
                updatedAt: '2026-11-18T09:30:00Z',
                requirements: [
                    req('req-1', 'Vehicle shall maintain safe following distance during cut-in', 'rejected', [
                        tc('tc-101', 'Cut-in at 80 km/h with 20 m gap', 'Accepted'),
                        tc('tc-102', 'Cut-in at 120 km/h with 10 m gap', 'in Review'),
                    ]),
                    req('req-2', 'Vehicle shall detect and warn about crossing pedestrians', 'Re-evaluation', [
                        tc('tc-103', 'Pedestrian crossing at marked crosswalk', 'Accepted'),
                        tc('tc-104', 'Pedestrian crossing at night', 'Draft'),
                        tc('tc-105', 'Occluded pedestrian between parked cars', 'in Review'),
                    ]),
                    req('req-3', 'Vehicle shall brake within 2s on wet road hazard detection', 'implemented', [
                        tc('tc-106', 'Wet road hazard braking at 60 km/h', 'Accepted'),
                        tc('tc-107', 'Wet road hazard braking at 100 km/h', 'Accepted'),
                    ]),
                    req('req-4', 'Vehicle shall not brake on non-hazard wet road objects', 'New', [
                        tc('tc-108', 'Wet road puddle false-positive check', 'Draft'),
                    ]),
                    req('req-5', 'Vehicle shall maintain lane within marked boundaries', 'in Progress', [
                        tc('tc-109', 'Lane keeping on curved highway', 'Accepted'),
                    ]),
                    req('req-6', 'Vehicle shall warn the driver when lane markings are lost', 'implemented', [
                        tc('tc-110', 'Lane marking loss in construction zone', 'Outdated'),
                    ]),
                ],
                children: [],
            },
            {
                id: 'driver-assistance',
                name: 'Driver Assistance',
                description: 'Assistance functions that support the driver during normal driving.',
                owner: 'ADAS Functions Team',
                updatedAt: '2026-11-15T14:10:00Z',
                requirements: [
                    req('req-7', 'Vehicle shall adapt cruise speed to the detected speed limit', 'in Progress', [
                        tc('tc-111', 'Speed limit sign change on highway', 'Draft'),
                    ]),
                    req('req-8', 'Vehicle shall hand over control when the driver takes the steering wheel', 'implemented', [
                        tc('tc-112', 'Driver override at 50 km/h', 'Accepted'),
                        tc('tc-113', 'Driver override at 130 km/h', 'Accepted'),
                    ]),
                    req('req-9', 'Vehicle shall disable assistance functions when sensors are blocked', 'New'),
                    req('req-10', 'Vehicle shall monitor driver attention while assistance is active', 'Re-evaluation', [
                        tc('tc-114', 'Driver looks away for more than 3 s', 'Draft'),
                    ]),
                ],
                children: [],
            },
            {
                id: 'crash-test',
                name: 'Crash Test',
                description: 'Requirements verified by crash and pre-crash test scenarios.',
                owner: 'Passive Safety Team',
                updatedAt: '2026-11-10T08:00:00Z',
                requirements: [
                    req('req-11', 'Vehicle shall tension the seatbelts before an unavoidable impact', 'implemented', [
                        tc('tc-115', 'Pre-crash belt tensioning at 50 km/h frontal impact', 'Accepted'),
                    ]),
                    req('req-12', 'Vehicle shall unlock the doors after a detected crash event', 'Obsolete'),
                ],
                children: [],
            },
        ],
    },
    {
        id: 'performance',
        name: 'Performance Requirements',
        description: 'Timing and throughput requirements for the perception and control pipeline.',
        owner: 'Platform Team',
        updatedAt: '2026-11-12T11:45:00Z',
        requirements: [],
        children: [
            {
                id: 'latency',
                name: 'Latency',
                description: 'End-to-end latency budgets.',
                owner: 'Platform Team',
                updatedAt: '2026-11-12T11:45:00Z',
                requirements: [
                    req('req-13', 'Object detection latency shall not exceed 100 ms', 'in Progress'),
                    req('req-14', 'Brake request latency shall not exceed 50 ms', 'implemented'),
                    req('req-15', 'Lane detection shall update at least 30 times per second', 'New'),
                    req('req-16', 'Warning display latency shall not exceed 200 ms', 'New'),
                    req('req-17', 'Sensor fusion output shall be available within 80 ms', 'Re-evaluation'),
                ],
                children: [],
            },
            {
                id: 'throughput',
                name: 'Throughput',
                description: 'Data rate and parallel processing requirements.',
                owner: 'Platform Team',
                updatedAt: '2026-11-09T16:20:00Z',
                requirements: [
                    req('req-18', 'Perception pipeline shall process 8 camera streams in parallel', 'in Progress'),
                    req('req-19', 'Radar processing shall sustain a 20 Hz update rate', 'implemented'),
                    req('req-20', 'Data recording shall sustain 500 MB/s without frame drops', 'New'),
                ],
                children: [],
            },
        ],
    },
    {
        id: 'compliance',
        name: 'Compliance Requirements',
        description: 'Standards and regulations the vehicle functions must comply with.',
        owner: 'Homologation Team',
        updatedAt: '2026-11-05T13:00:00Z',
        requirements: [],
        children: [
            {
                id: 'iso-26262',
                name: 'ISO 26262',
                description: 'Functional safety requirements.',
                owner: 'Homologation Team',
                updatedAt: '2026-11-05T13:00:00Z',
                requirements: [
                    req('req-21', 'Safety goals shall be derived from a hazard analysis and risk assessment', 'implemented'),
                    req('req-22', 'The braking function shall meet ASIL D integrity', 'in Progress'),
                    req('req-23', 'Faults shall be detected within the fault tolerant time interval', 'New'),
                    req('req-24', 'Safety requirements shall be traceable to test cases', 'rejected'),
                ],
                children: [],
            },
            {
                id: 'unece-r157',
                name: 'UNECE R157',
                description: 'Automated lane keeping system regulation.',
                owner: 'Homologation Team',
                updatedAt: '2026-10-29T10:15:00Z',
                requirements: [
                    req('req-25', 'Lane change shall complete within the time defined by UNECE R157', 'in Progress'),
                    req('req-26', 'System shall issue a transition demand before leaving its operational design domain', 'New'),
                ],
                children: [],
            },
        ],
    },
    {
        id: 'user-experience',
        name: 'User Experience',
        description: 'Driver-facing alerts, displays and interaction requirements.',
        owner: 'HMI Team',
        updatedAt: '2026-11-17T15:40:00Z',
        requirements: [],
        children: [
            {
                id: 'hmi-alerts',
                name: 'HMI Alerts',
                description: 'Warnings and notifications presented to the driver.',
                owner: 'HMI Team',
                updatedAt: '2026-11-17T15:40:00Z',
                requirements: [
                    req('req-27', 'Critical warnings shall be shown within the driver field of view', 'implemented'),
                    req('req-28', 'Warning sounds shall be distinguishable from infotainment audio', 'in Progress'),
                    req('req-29', 'Warning priority shall follow the defined severity levels', 'New'),
                    req('req-30', 'Haptic feedback shall accompany critical collision warnings', 'Re-evaluation'),
                    req('req-31', 'Alerts shall be dismissible only after the hazard is cleared', 'rejected'),
                    req('req-32', 'Alert text shall be available in all supported languages', 'New'),
                ],
                children: [],
            },
            {
                id: 'driver-display',
                name: 'Driver Display',
                description: 'Instrument cluster and head-up display content.',
                owner: 'HMI Team',
                updatedAt: '2026-11-11T09:05:00Z',
                requirements: [
                    req('req-33', 'Cluster shall display the active assistance mode at all times', 'implemented'),
                    req('req-34', 'Display brightness shall adapt to ambient light', 'in Progress'),
                    req('req-35', 'Lane guidance shall be rendered at 60 frames per second', 'New'),
                    req('req-36', 'Display shall show the detected speed limit', 'None'),
                ],
                children: [],
            },
        ],
    },
];

// ---------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------

/** All requirements in a folder including every descendant folder (this is what the folder count shows). */
function collectRequirements(folder: RequirementFolder): RequirementItem[] {
    return [...folder.requirements, ...folder.children.flatMap(collectRequirements)];
}

function findFolder(folders: RequirementFolder[], id: string): RequirementFolder | undefined {
    for (const folder of folders) {
        if (folder.id === id) return folder;
        const match = findFolder(folder.children, id);
        if (match) return match;
    }
    return undefined;
}

function matchesQuery(requirement: RequirementItem, query: string): boolean {
    return requirement.name.toLowerCase().includes(query) || requirement.id.toLowerCase().includes(query);
}

/** A folder is visible while searching if its name, one of its requirements or a descendant matches. */
function isFolderVisible(folder: RequirementFolder, query: string): boolean {
    if (!query) return true;
    return (
        folder.name.toLowerCase().includes(query) ||
        folder.requirements.some((requirement) => matchesQuery(requirement, query)) ||
        folder.children.some((child) => isFolderVisible(child, query))
    );
}

function badgeClass(status: string): string {
    return `badge badge--${status.replace(' ', '-').toLowerCase()}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------------------------------------
// Icons (inline so no new assets are needed)
// ---------------------------------------------------------------------------------------------------------

interface IconProps {
    className?: string;
}

function svgProps(className?: string) {
    return {
        className,
        width: 18,
        height: 18,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    };
}

function ChevronIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

function FolderIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path
                d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                fill="currentColor"
                fillOpacity="0.2"
            />
        </svg>
    );
}

function SearchIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

function FilterIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path d="M3 5h18l-7 8v6l-4-2v-4z" />
        </svg>
    );
}

function GridIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function ListIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
    );
}

function RocketIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path d="M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5" />
            <path d="M12 15 9 12c1-3 3-6 6-8 2-1 5-1 5-1s0 3-1 5c-2 3-5 5-8 6z" />
            <circle cx="15" cy="9" r="1.5" />
        </svg>
    );
}

function KebabIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <path d="M12 5h.01M12 12h.01M12 19h.01" strokeWidth={3} />
        </svg>
    );
}

function InfoIcon({ className }: IconProps) {
    return (
        <svg {...svgProps(className)}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
        </svg>
    );
}

// ---------------------------------------------------------------------------------------------------------
// Folder tree
// ---------------------------------------------------------------------------------------------------------

interface FolderTreeItemProps {
    folder: RequirementFolder;
    depth: number;
    query: string;
    selectedFolderId: string;
    expandedFolderIds: ReadonlySet<string>;
    onSelect: (folderId: string) => void;
    onToggle: (folderId: string) => void;
}

function FolderTreeItem({
    folder,
    depth,
    query,
    selectedFolderId,
    expandedFolderIds,
    onSelect,
    onToggle,
}: FolderTreeItemProps) {
    if (!isFolderVisible(folder, query)) return null;

    const hasChildren = folder.children.length > 0;
    const isExpanded = hasChildren && (query !== '' || expandedFolderIds.has(folder.id));
    const isSelected = folder.id === selectedFolderId;
    const total = collectRequirements(folder).length;

    return (
        <li role="none">
            <div
                className={`requirements-view__folder-row${isSelected ? ' requirements-view__folder-row--selected' : ''}`}
                style={{ '--depth': depth } as CSSProperties}
            >
                <button
                    type="button"
                    className="requirements-view__chevron"
                    onClick={() => onToggle(folder.id)}
                    disabled={!hasChildren}
                    aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                >
                    <ChevronIcon
                        className={`requirements-view__chevron-icon${isExpanded ? ' requirements-view__chevron-icon--open' : ''}`}
                    />
                </button>
                <button
                    type="button"
                    className="requirements-view__folder-button"
                    onClick={() => onSelect(folder.id)}
                    aria-current={isSelected ? 'true' : undefined}
                >
                    <FolderIcon className="requirements-view__folder-icon" />
                    <span className="requirements-view__folder-name">{folder.name}</span>
                    <span className="requirements-view__count">{total}</span>
                </button>
            </div>
            {isExpanded && (
                <ul className="requirements-view__folder-list" role="group">
                    {folder.children.map((child) => (
                        <FolderTreeItem
                            key={child.id}
                            folder={child}
                            depth={depth + 1}
                            query={query}
                            selectedFolderId={selectedFolderId}
                            expandedFolderIds={expandedFolderIds}
                            onSelect={onSelect}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

// ---------------------------------------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------------------------------------

export function RequirementsView() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | RequirementStatus>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [activeTab, setActiveTab] = useState<DetailTab>('requirements');
    const [selectedFolderId, setSelectedFolderId] = useState(DEFAULT_FOLDER_ID);
    const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set([DEFAULT_FOLDER_ID]));
    const [expandedRequirementIds, setExpandedRequirementIds] = useState<Set<string>>(() => new Set());
    const [page, setPage] = useState(1);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

    const {
        selectedRequirementIds,
        selectedTestCaseIds,
        getRequirementSelectionState,
        isTestCaseSelected,
        toggleRequirement,
        toggleTestCase,
    } = useCampaignDraft();
    const hasSelection = selectedRequirementIds.size > 0 || selectedTestCaseIds.size > 0;

    const query = search.trim().toLowerCase();
    const selectedFolder = findFolder(FOLDERS, selectedFolderId) ?? FOLDERS[0];

    const folderRequirements = useMemo(() => collectRequirements(selectedFolder), [selectedFolder]);
    const filteredRequirements = useMemo(
        () =>
            folderRequirements.filter(
                (requirement) =>
                    (statusFilter === 'all' || requirement.status === statusFilter) &&
                    (query === '' || matchesQuery(requirement, query)),
            ),
        [folderRequirements, statusFilter, query],
    );
    const statusSummary = useMemo(() => {
        const counts = new Map<RequirementStatus, number>();
        for (const requirement of folderRequirements) {
            counts.set(requirement.status, (counts.get(requirement.status) ?? 0) + 1);
        }
        return STATUS_OPTIONS.filter((status) => counts.has(status)).map((status) => ({
            status,
            count: counts.get(status) ?? 0,
        }));
    }, [folderRequirements]);

    const totalPages = Math.max(1, Math.ceil(filteredRequirements.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const firstIndex = filteredRequirements.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastIndex = Math.min(filteredRequirements.length, currentPage * PAGE_SIZE);
    const pageItems = filteredRequirements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSearchChange(value: string) {
        setSearch(value);
        setPage(1);
    }

    function handleSelectFolder(folderId: string) {
        setSelectedFolderId(folderId);
        setActiveTab('requirements');
        setPage(1);
    }

    function handleToggleFolder(folderId: string) {
        setExpandedFolderIds((previous) => {
            const next = new Set(previous);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    }

    function handleToggleRequirement(requirementId: string) {
        setExpandedRequirementIds((previous) => {
            const next = new Set(previous);
            if (next.has(requirementId)) next.delete(requirementId);
            else next.add(requirementId);
            return next;
        });
    }

    function handleStatusFilter(value: 'all' | RequirementStatus) {
        setStatusFilter(value);
        setIsFilterOpen(false);
        setPage(1);
    }

    function renderCheckbox(requirement: RequirementItem) {
        const state = getRequirementSelectionState(requirement);
        return (
            <input
                type="checkbox"
                className="requirements-view__checkbox"
                checked={state === 'all'}
                ref={(el) => {
                    if (el) el.indeterminate = state === 'partial';
                }}
                onChange={() => toggleRequirement(requirement)}
                aria-label={`Select requirement ${requirement.name}`}
            />
        );
    }

    return (
        <section className="requirements-view">
            <header className="requirements-view__header">
                <div>
                    <h1 className="requirements-view__title">Requirements</h1>
                    <p className="requirements-view__subtitle">Browse and manage requirements in a structured folder hierarchy.</p>
                    {hasSelection && (
                        <p className="requirements-view__selection-summary">
                            {selectedRequirementIds.size} requirement(s) fully selected, {selectedTestCaseIds.size} additional
                            test case(s) selected
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    className="requirements-view__create-campaign"
                    disabled={!hasSelection}
                    onClick={() => setIsCampaignModalOpen(true)}
                >
                    <RocketIcon />
                    Create Campaign
                    <span aria-hidden="true">→</span>
                </button>
            </header>

            <div className="requirements-view__toolbar">
                <label className="requirements-view__search">
                    <SearchIcon className="requirements-view__search-icon" />
                    <input
                        type="search"
                        className="requirements-view__search-input"
                        placeholder="Search folders or requirements…"
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        aria-label="Search folders or requirements"
                    />
                </label>

                <div className="requirements-view__filter">
                    <button
                        type="button"
                        className={`requirements-view__filter-button${statusFilter !== 'all' ? ' requirements-view__filter-button--active' : ''}`}
                        onClick={() => setIsFilterOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={isFilterOpen}
                    >
                        <FilterIcon />
                        {statusFilter === 'all' ? 'Filter' : statusFilter}
                    </button>
                    {isFilterOpen && (
                        <ul className="requirements-view__filter-menu" role="listbox" aria-label="Filter by status">
                            {(['all', ...STATUS_OPTIONS] as const).map((option) => (
                                <li key={option} role="none">
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={statusFilter === option}
                                        className={`requirements-view__filter-option${statusFilter === option ? ' requirements-view__filter-option--selected' : ''}`}
                                        onClick={() => handleStatusFilter(option)}
                                    >
                                        {option === 'all' ? 'All statuses' : option}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="requirements-view__view-toggle" role="group" aria-label="Requirement layout">
                    <button
                        type="button"
                        className={`requirements-view__view-button${viewMode === 'grid' ? ' requirements-view__view-button--active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'grid'}
                    >
                        <GridIcon />
                    </button>
                    <button
                        type="button"
                        className={`requirements-view__view-button${viewMode === 'list' ? ' requirements-view__view-button--active' : ''}`}
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                    >
                        <ListIcon />
                    </button>
                </div>
            </div>

            <div className="requirements-view__body">
                <aside className="requirements-view__panel requirements-view__folders" aria-label="Folders">
                    <h2 className="requirements-view__panel-title">Folders</h2>
                    <ul className="requirements-view__folder-list requirements-view__folder-list--root" role="tree">
                        {FOLDERS.map((folder) => (
                            <FolderTreeItem
                                key={folder.id}
                                folder={folder}
                                depth={0}
                                query={query}
                                selectedFolderId={selectedFolder.id}
                                expandedFolderIds={expandedFolderIds}
                                onSelect={handleSelectFolder}
                                onToggle={handleToggleFolder}
                            />
                        ))}
                    </ul>
                    {query !== '' && !FOLDERS.some((folder) => isFolderVisible(folder, query)) && (
                        <p className="requirements-view__status">No folders match your search.</p>
                    )}
                </aside>

                <div className="requirements-view__panel requirements-view__content">
                    <div className="requirements-view__folder-header">
                        <FolderIcon className="requirements-view__folder-header-icon" />
                        <div className="requirements-view__folder-header-text">
                            <h2 className="requirements-view__folder-title">{selectedFolder.name}</h2>
                            <p className="requirements-view__folder-description">{selectedFolder.description}</p>
                        </div>
                        <span className="requirements-view__pill">{folderRequirements.length} Requirements</span>
                        <button type="button" className="requirements-view__icon-button" aria-label="Folder actions">
                            <KebabIcon />
                        </button>
                    </div>

                    <div className="requirements-view__tabs" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'requirements'}
                            className={`requirements-view__tab${activeTab === 'requirements' ? ' requirements-view__tab--active' : ''}`}
                            onClick={() => setActiveTab('requirements')}
                        >
                            <ListIcon />
                            Requirements ({filteredRequirements.length})
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'details'}
                            className={`requirements-view__tab${activeTab === 'details' ? ' requirements-view__tab--active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <InfoIcon />
                            Details
                        </button>
                    </div>

                    {activeTab === 'requirements' && (
                        <div className="requirements-view__tab-panel" role="tabpanel">
                            {pageItems.length === 0 && (
                                <p className="requirements-view__status">No requirements match your search or filter.</p>
                            )}

                            {pageItems.length > 0 && viewMode === 'list' && (
                                <ul className="requirements-view__list">
                                    {pageItems.map((requirement) => {
                                        const isExpanded = expandedRequirementIds.has(requirement.id);
                                        return (
                                            <li key={requirement.id} className="requirements-view__item">
                                                <div className="requirements-view__row">
                                                    <button
                                                        type="button"
                                                        className="requirements-view__chevron"
                                                        onClick={() => handleToggleRequirement(requirement.id)}
                                                        aria-expanded={isExpanded}
                                                        aria-label={isExpanded ? 'Collapse test cases' : 'Expand test cases'}
                                                    >
                                                        <ChevronIcon
                                                            className={`requirements-view__chevron-icon${isExpanded ? ' requirements-view__chevron-icon--open' : ''}`}
                                                        />
                                                    </button>
                                                    {renderCheckbox(requirement)}
                                                    <span className="requirements-view__req-name">{requirement.name}</span>
                                                    <span className="requirements-view__req-id">{requirement.id}</span>
                                                    <span className={badgeClass(requirement.status)}>{requirement.status}</span>
                                                    <button
                                                        type="button"
                                                        className="requirements-view__icon-button"
                                                        aria-label={`Actions for ${requirement.name}`}
                                                    >
                                                        <KebabIcon />
                                                    </button>
                                                </div>
                                                {isExpanded && (
                                                    <ul className="requirements-view__test-cases">
                                                        {requirement.testCases.length === 0 && (
                                                            <li className="requirements-view__status">
                                                                No test cases linked to this requirement.
                                                            </li>
                                                        )}
                                                        {requirement.testCases.map((testCase) => (
                                                            <li key={testCase.id} className="requirements-view__test-case">
                                                                <input
                                                                    type="checkbox"
                                                                    className="requirements-view__checkbox"
                                                                    checked={isTestCaseSelected(requirement, testCase.id)}
                                                                    onChange={() => toggleTestCase(requirement, testCase.id)}
                                                                    aria-label={`Select test case ${testCase.name}`}
                                                                />
                                                                <span className="requirements-view__req-name">{testCase.name}</span>
                                                                <span className="requirements-view__req-id">{testCase.id}</span>
                                                                <span className={badgeClass(testCase.status)}>{testCase.status}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {pageItems.length > 0 && viewMode === 'grid' && (
                                <ul className="requirements-view__grid">
                                    {pageItems.map((requirement) => (
                                        <li key={requirement.id} className="requirements-view__card">
                                            <div className="requirements-view__card-top">
                                                {renderCheckbox(requirement)}
                                                <span className="requirements-view__req-id">{requirement.id}</span>
                                                <span className={badgeClass(requirement.status)}>{requirement.status}</span>
                                            </div>
                                            <p className="requirements-view__card-name">{requirement.name}</p>
                                            <p className="requirements-view__card-meta">
                                                {requirement.testCases.length} test case(s)
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="requirements-view__pagination" role="navigation" aria-label="Requirements pagination">
                                <span className="requirements-view__pagination-summary">
                                    {filteredRequirements.length === 0
                                        ? '0 requirements'
                                        : `Showing ${firstIndex}–${lastIndex} of ${filteredRequirements.length} requirements`}
                                </span>
                                <div className="requirements-view__pagination-controls">
                                    <button
                                        type="button"
                                        className="requirements-view__page-button"
                                        onClick={() => setPage(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        aria-label="Previous page"
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            className={`requirements-view__page-button${pageNumber === currentPage ? ' requirements-view__page-button--active' : ''}`}
                                            onClick={() => setPage(pageNumber)}
                                            aria-label={`Page ${pageNumber}`}
                                            aria-current={pageNumber === currentPage ? 'page' : undefined}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="requirements-view__page-button"
                                        onClick={() => setPage(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        aria-label="Next page"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="requirements-view__tab-panel" role="tabpanel">
                            <dl className="requirements-view__details">
                                <dt>Folder</dt>
                                <dd>{selectedFolder.name}</dd>
                                <dt>Description</dt>
                                <dd>{selectedFolder.description}</dd>
                                <dt>Owner</dt>
                                <dd>{selectedFolder.owner}</dd>
                                <dt>Last updated</dt>
                                <dd>{formatDate(selectedFolder.updatedAt)}</dd>
                                <dt>Sub folders</dt>
                                <dd>{selectedFolder.children.length}</dd>
                                <dt>Requirements</dt>
                                <dd>{folderRequirements.length}</dd>
                                <dt>By status</dt>
                                <dd className="requirements-view__status-summary">
                                    {statusSummary.map(({ status, count }) => (
                                        <span key={status} className={badgeClass(status)}>
                                            {status}: {count}
                                        </span>
                                    ))}
                                </dd>
                            </dl>
                        </div>
                    )}
                </div>
            </div>

            {isCampaignModalOpen && (
                <div className="requirements-view__modal-backdrop" role="presentation">
                    <div
                        className="requirements-view__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="requirements-campaign-modal-title"
                    >
                        <button
                            type="button"
                            className="requirements-view__modal-close"
                            aria-label="Close campaign form"
                            onClick={() => setIsCampaignModalOpen(false)}
                        >
                            ×
                        </button>
                        <CampaignBuilderView modalTitleId="requirements-campaign-modal-title" />
                    </div>
                </div>
            )}
        </section>
    );
}
