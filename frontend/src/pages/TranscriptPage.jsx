import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getStudent } from '../api';
import logo from '../assets/Badge.jpg';

const GRADE_COLOR = {
  'A+': 'bg-emerald-100 text-emerald-800',
  'A':  'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  'B':  'bg-sky-100 text-sky-800',
  'C':  'bg-yellow-100 text-yellow-800',
  'D':  'bg-orange-100 text-orange-800',
  'F':  'bg-red-100 text-red-800',
};

const PDF_WIDTH = 900;

function gradeColor(g) {
  return GRADE_COLOR[g] || 'bg-gray-100 text-gray-700';
}

function calcGrade(avg) {
  const n = parseFloat(avg);
  if (isNaN(n)) return null;
  if (n >= 90) return 'A+';
  if (n >= 80) return 'A';
  if (n >= 75) return 'B+';
  if (n >= 65) return 'B';
  if (n >= 55) return 'C';
  if (n >= 45) return 'D';
  return 'F';
}

function resolveGrade(average_grade, average) {
  if (average_grade && average_grade !== 'N/A') return average_grade;
  return calcGrade(average) || 'N/A';
}

// ── PDF template (inline styles only — no Tailwind) ──────────────────────────
const GRADE_STYLES = {
  'A+': ['#d1fae5','#065f46'], 'A': ['#dcfce7','#166534'],
  'B+': ['#dbeafe','#1e40af'], 'B': ['#e0f2fe','#0c4a6e'],
  'C':  ['#fef9c3','#854d0e'], 'D': ['#ffedd5','#9a3412'],
  'F':  ['#fee2e2','#991b1b'],
};

function pdfBadge(g) {
  const [bg, fg] = GRADE_STYLES[g] || ['#f3f4f6','#374151'];
  return `background:${bg};color:${fg};padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;display:inline-block;white-space:nowrap;`;
}

function PdfTranscript({ student, logoSrc }) {
  const red = '#991b1b';
  return (
    <div style={{ fontFamily:'Arial,sans-serif', background:'#fff', width:`${PDF_WIDTH}px`, fontSize:'13px', color:'#111' }}>
      {/* Header */}
      <div style={{ background:red, color:'#fff', padding:'28px 36px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' }}>
          <img src={logoSrc} alt="Logo" style={{ width:'56px', height:'56px', objectFit:'cover', borderRadius:'8px', border:'2px solid rgba(255,255,255,0.25)' }} />
          <div>
            <div style={{ fontWeight:'bold', fontSize:'20px', lineHeight:'1.2' }}>Peter Harvard International Schools</div>
            <div style={{ fontSize:'12px', color:'#fecaca', marginTop:'2px' }}>Official Academic Transcript</div>
          </div>
        </div>
        <div style={{ height:'1px', background:'rgba(255,255,255,0.3)', margin:'12px 0' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:'16px' }}>
          <div>
            <div style={{ fontWeight:'bold', fontSize:'22px', letterSpacing:'0.5px' }}>{student.full_name}</div>
            <div style={{ color:'#fecaca', fontSize:'13px', marginTop:'4px' }}>
              Student ID: <strong style={{ color:'#fff' }}>{student.student_id}</strong>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#fecaca' }}>Date Generated</div>
            <div style={{ fontWeight:'bold', fontSize:'15px' }}>{student.date_generated}</div>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#fecaca', marginTop:'10px' }}>Total Terms</div>
            <div style={{ fontWeight:'bold', fontSize:'15px' }}>{student.terms?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:'20px' }}>
        {student.terms?.map((term, idx) => {
          const grade = resolveGrade(term.average_grade, term.average);
          return (
            <div key={idx} style={{ border:'1px solid #e5e7eb', borderRadius:'10px', overflow:'hidden' }}>
              <div style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <span style={{ fontWeight:'600', fontSize:'13px' }}>{term.term}</span>
                  <span style={{ color:'#d1d5db', margin:'0 8px' }}>·</span>
                  <span style={{ color:'#6b7280', fontSize:'12px' }}>{term.period}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px' }}>
                  <span style={{ color:'#6b7280' }}>Average:</span>
                  <strong>{term.average}</strong>
                  <span style={{ ...Object.fromEntries(pdfBadge(grade).split(';').filter(Boolean).map(s => { const [k,...v]=s.split(':'); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(':').trim()]; })) }}>{grade}</span>
                </div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background:'#fef2f2', color:red, padding:'7px 14px', fontWeight:'600', fontSize:'12px', textAlign:'left', borderBottom:'1px solid #fecaca' }}>Subject</th>
                    <th style={{ background:'#fef2f2', color:red, padding:'7px 10px', fontWeight:'600', fontSize:'12px', textAlign:'center', borderBottom:'1px solid #fecaca', width:'80px' }}>Score</th>
                    <th style={{ background:'#fef2f2', color:red, padding:'7px 10px', fontWeight:'600', fontSize:'12px', textAlign:'center', borderBottom:'1px solid #fecaca', width:'80px' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {term.subjects?.map((subj, si) => (
                    <tr key={si} style={{ background: si % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding:'6px 14px', color:'#374151', fontSize:'12px' }}>{subj.subject}</td>
                      <td style={{ padding:'6px 10px', textAlign:'center', fontWeight:'500', fontSize:'12px' }}>{subj.score}</td>
                      <td style={{ padding:'6px 10px', textAlign:'center' }}>
                        <span dangerouslySetInnerHTML={{ __html: `<span style="${pdfBadge(subj.grade)}">${subj.grade}</span>` }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background:red, color:'#fff' }}>
                    <td style={{ padding:'8px 14px', fontWeight:'600', fontSize:'12px' }}>Term Average</td>
                    <td style={{ padding:'8px 10px', textAlign:'center', fontWeight:'700', fontSize:'12px' }}>{term.average}</td>
                    <td style={{ padding:'8px 10px', textAlign:'center' }}>
                      <span style={{ background:'#fff', color:red, padding:'2px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:'700', display:'inline-block' }}>{grade}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop:'1px solid #f3f4f6', padding:'12px 28px', background:'#f9fafb', display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9ca3af' }}>
        <span>Peter Harvard International Schools — Official Transcript</span>
        <span>Generated: {student.date_generated}</span>
      </div>
    </div>
  );
}

export default function TranscriptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    getStudent(decodeURIComponent(id))
      .then(setStudent)
      .catch(() => setError('Student not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadJSON = () => {
    if (!student) return;
    const blob = new Blob([JSON.stringify(student, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.student_id.replace(/\//g, '-')}_transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!student) return;
    setPdfLoading(true);
    let container = null;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Convert logo to base64
      const logoBase64 = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = img.width; c.height = img.height;
          c.getContext('2d').drawImage(img, 0, 0);
          resolve(c.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = logo;
      });

      // Render to static HTML string — no React tree conflict
      const html = renderToStaticMarkup(
        <PdfTranscript student={student} logoSrc={logoBase64} />
      );

      // Inject into off-screen fixed-width container
      container = document.createElement('div');
      container.style.cssText = `position:fixed;left:-9999px;top:0;width:${PDF_WIDTH}px;z-index:-1;background:#fff;`;
      container.innerHTML = html;
      document.body.appendChild(container);

      // Wait for images to paint
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: PDF_WIDTH,
        windowWidth: PDF_WIDTH,
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      const pageHeightPx = Math.floor((canvas.width * usableH) / usableW);

      for (let y = 0, page = 0; y < canvas.height; y += pageHeightPx, page++) {
        const sliceH = Math.min(pageHeightPx, canvas.height - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (page > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, usableW, (sliceH * usableW) / canvas.width);
      }

      pdf.save(`${student.student_id.replace(/\//g, '-')}_transcript.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      if (container?.parentNode) container.parentNode.removeChild(container);
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
        <p className="text-gray-500">Loading transcript...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col"><Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 font-medium text-center">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="no-print"><Header /></div>

      {/* Action Bar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <button onClick={() => navigate(-1)} className="text-primary-700 hover:text-primary-900 flex items-center gap-1 text-sm font-medium flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-2">
            <button onClick={downloadJSON} className="btn-outline text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              JSON
            </button>
            <button onClick={downloadPDF} disabled={pdfLoading} className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 flex items-center gap-1.5">
              {pdfLoading
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
              }
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-8">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-primary-700 text-white px-4 sm:px-8 py-5 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <img src={logo} alt="PHIS Logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 border-2 border-white/30" />
                  <div className="min-w-0">
                    <h1 className="font-bold text-base sm:text-xl leading-tight">Peter Harvard International Schools</h1>
                    <p className="text-primary-200 text-xs sm:text-sm">Official Academic Transcript</p>
                  </div>
                </div>
                <div className="h-px bg-primary-500 mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-2xl font-bold tracking-wide break-words">{student.full_name}</h2>
                <p className="text-primary-200 text-sm mt-1">Student ID: <span className="text-white font-semibold">{student.student_id}</span></p>
              </div>
              <div className="flex flex-row sm:flex-col gap-4 sm:gap-0 sm:text-right flex-shrink-0">
                <div>
                  <p className="text-primary-200 text-xs uppercase tracking-wider mb-0.5">Date Generated</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{student.date_generated}</p>
                </div>
                <div>
                  <p className="text-primary-200 text-xs uppercase tracking-wider mb-0.5 sm:mt-3">Total Terms</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{student.terms?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {student.terms?.map((term, idx) => {
              const grade = resolveGrade(term.average_grade, term.average);
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">{term.term}</span>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{term.period}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">Avg:</span>
                      <span className="font-bold text-gray-800 text-sm">{term.average}</span>
                      <span className={`grade-badge ${gradeColor(grade)}`}>{grade}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[280px]">
                      <thead>
                        <tr className="bg-primary-50 text-primary-800">
                          <th className="text-left px-3 sm:px-5 py-2 font-semibold">Subject</th>
                          <th className="text-center px-2 sm:px-3 py-2 font-semibold w-14 sm:w-20">Score</th>
                          <th className="text-center px-2 sm:px-3 py-2 font-semibold w-16 sm:w-20">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {term.subjects?.map((subj, si) => (
                          <tr key={si} className={si % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 sm:px-5 py-1.5 sm:py-2 text-gray-700 text-xs sm:text-sm">{subj.subject}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-800 text-xs sm:text-sm">{subj.score}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                              <span className={`grade-badge ${gradeColor(subj.grade)}`}>{subj.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary-700 text-white">
                          <td className="px-3 sm:px-5 py-2 font-semibold text-xs sm:text-sm">Term Average</td>
                          <td className="px-2 sm:px-3 py-2 text-center font-bold text-xs sm:text-sm">{term.average}</td>
                          <td className="px-2 sm:px-3 py-2 text-center">
                            <span className="grade-badge bg-white text-primary-700">{grade}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-xs text-gray-400 text-center sm:text-left">
            <span>Peter Harvard International Schools — Official Transcript</span>
            <span>Generated: {student.date_generated}</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
