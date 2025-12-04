export default function Tabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex gap-6 border-b border-gray-300 dark:border-gray-700 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-3 font-semibold text-sm uppercase tracking-wide transition-all !bg-transparent !border-none relative flex items-center gap-2 whitespace-nowrap ${
                        activeTab === tab.id
                            ? '!text-lighter-green'
                            : '!text-gray-600 dark:!text-gray-400 hover:!text-gray-900 dark:hover:!text-gray-100'
                    }`}
                >
                    {tab.icon && (
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {tab.icon}
                        </span>
                    )}
                    <span className="tab-label">{tab.label}</span>
                    {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-lighter-green"></span>
                    )}
                </button>
            ))}
        </div>
    );
}
