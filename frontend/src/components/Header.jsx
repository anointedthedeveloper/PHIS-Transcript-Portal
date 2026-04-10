import { Link } from 'react-router-dom';
import logo from '../assets/Badge.jpg';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-primary-600/95 text-white shadow-[0_10px_30px_rgba(17,24,39,0.18)] backdrop-blur">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3">
        <img
          src={logo}
          alt="PHIS Logo"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover flex-shrink-0 border border-white/20 shadow-lg"
        />
        <Link to="/" className="block min-w-0">
          <h1 className="font-bold text-sm sm:text-lg leading-tight truncate">
            Peter Harvard International Schools
          </h1>
          <p className="text-red-100 text-xs sm:text-sm">Student Transcript Archive</p>
        </Link>
      </div>
    </header>
  );
}
