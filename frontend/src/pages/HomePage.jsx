import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import logo from '../assets/Badge.jpg';

export default function HomePage() {
  const [form, setForm] = useState({ name: '', student_id: '', year: '' });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.name.trim()) params.set('name', form.name.trim());
    if (form.student_id.trim()) params.set('student_id', form.student_id.trim());
    if (form.year.trim()) params.set('year', form.year.trim());
    if (!params.toString()) return;
    navigate(`/results?${params}`);
  };
return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.11),_transparent_34%),linear-gradient(180deg,_#fffafa_0%,_#f8fafc_50%,_#ffffff_100%)]">
      <Header />

      <main className="flex-1 flex items-center">
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.92fr] items-center">
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/85 px-4 py-2 text-xs sm:text-sm text-primary-700 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Official transcript search portal
              </div>

              <div className="space-y-3">
                <img
                  src={logo}
                  alt="PHIS Logo"
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                />
                <div className="space-y-2 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl lg:text-[3.35rem] font-black tracking-tight text-gray-900 leading-[1.02]">
                    Find, review, and download student transcripts in one place.
                  </h2>
                  <p className="text-sm sm:text-base lg:text-[1.05rem] text-gray-600 leading-6 sm:leading-7 max-w-xl">
                    Search by student name, ID, or academic year to quickly reach the correct
                    record. Each transcript opens with a clean result view and a polished PDF
                    download flow.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Fast lookup', 'Combine name, ID, and year for tighter matches.'],
                  ['Download ready', 'Open a transcript and export a PDF or JSON copy.'],
                  ['Mobile friendly', 'Responsive layouts for phones, tablets, and desktop.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-600 leading-6">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2rem] bg-primary-950/10 blur-3xl" />
              <div className="card overflow-hidden border-gray-200 shadow-[0_25px_60px_rgba(17,24,39,0.12)]">
                <div className="bg-primary-500 px-5 sm:px-6 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-red-100">Search transcripts</p>
                  <h3 className="mt-1 text-lg font-semibold">Start with the student details you know</h3>
                  <p className="mt-1 text-sm text-primary-100/90">
                    Enter any combination of fields to narrow results.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        className="input-field text-base py-3"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        Student ID
                      </label>
                      <input
                        type="text"
                        className="input-field text-base py-3"
                        placeholder="e.g. PHIS/PP/001 or just 001"
                        value={form.student_id}
                        onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                        Academic Year / Session
                      </label>
                      <input
                        type="text"
                        className="input-field text-base py-3"
                        placeholder="e.g. 2018/2019"
                        value={form.year}
                        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
                      disabled={!form.name && !form.student_id && !form.year}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search transcripts
                    </button>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
