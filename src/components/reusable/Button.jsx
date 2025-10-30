export default function Button({ children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`min-w-[160px] h-12 px-6 py-3 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 flex items-center justify-center box-border !border-none ${className}`}
        >
            {children}
        </button>
    );
}
