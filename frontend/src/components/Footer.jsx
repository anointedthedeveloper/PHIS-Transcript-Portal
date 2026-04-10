export default function Footer() {
  return (
    <footer className="text-center py-5 text-xs text-gray-500 border-t border-gray-200 bg-white/80 backdrop-blur px-4 space-y-1">
      <p>© {new Date().getFullYear()} Peter Harvard International Schools. All rights reserved.</p>
      <p>
        Powered by{' '}
        <a
          href="https://anobyte.online"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-700 hover:text-primary-900 font-medium transition-colors"
        >
          Anobyte
        </a>
        {' · '}
        Designed by{' '}
        <a
          href="https://github.com/anointedthedeveloper"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-700 hover:text-primary-900 font-medium transition-colors"
        >
          anointedthedeveloper
        </a>
      </p>
    </footer>
  );
}
