import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { searchStudents } from '../api';

function initials(name) {
  return name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const name = searchParams.get('name') || '';
  const student_id = searchParams.get('student_id') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      setError('');
      setRedirecting(false);
      setLoading(true);
    });

    searchStudents({ name, student_id, year })
      .then((data) => {
        if (!active) return;

        if (student_id && !name && !year && data.length === 1) {
          setRedirecting(true);
          navigate(`/transcript/${encodeURIComponent(data[0].student_id)}`, { replace: true });
          return;
        }

        setResults(data);
      })
      .catch(() => {
        if (active) setError('Failed to connect to the server. Make sure the backend is running.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [name, student_id, year, navigate]);

  const queryLabel = [
    name && `Name: "${name}"`,
    student_id && `ID: "${student_id}"`,
    year && `Year: "${year}"`,
  ]
    .filter(Boolean)
    .join(' · ');

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
          <p className="text-gray-500">Opening transcript...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/90 p-5 sm:p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to search
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Search results</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Click a student to open the transcript and download the official PDF copy.
              </p>
            </div>
          </div>

          {queryLabel && (
            <div className="rounded-2xl bg-primary-50 px-4 py-3 text-sm text-primary-900 border border-primary-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 mb-1">Active filters</p>
              <p className="leading-6">{queryLabel}</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
            <p className="text-gray-500">Searching transcripts...</p>
          </div>
        )}

        {error && (
          <div className="card p-5 sm:p-6 text-center border-red-100">
            <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {results.length > 0
                  ? `${results.length} Result${results.length !== 1 ? 's' : ''} Found`
                  : 'No Results Found'}
              </h3>
              <p className="hidden sm:block text-sm text-gray-500">
                Results open in a dedicated transcript page with download controls.
              </p>
            </div>

            {results.length === 0 ? (
              <div className="card p-8 sm:p-12 text-center">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16 text-gray-200 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-700 font-medium">No transcripts matched your search.</p>
                <p className="text-gray-500 text-sm mt-1">Try a different name, ID, or academic year.</p>
                <button onClick={() => navigate('/')} className="btn-primary mt-6">
                  New Search
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((student) => (
                  <Link
                    key={student.student_id}
                    to={`/transcript/${encodeURIComponent(student.student_id)}`}
                    className="group card p-4 sm:p-5 flex items-center justify-between hover:shadow-lg hover:border-primary-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0 ring-4 ring-primary-50">
                        <span className="text-primary-700 font-bold text-xs sm:text-sm">
                          {initials(student.full_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                          {student.full_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">{student.student_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-2">
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">
                          {student.term_count} Term{student.term_count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-400 hidden sm:block">on record</p>
                      </div>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-primary-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
