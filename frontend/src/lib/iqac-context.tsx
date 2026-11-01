import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from './api-client';

const IqacContext = createContext<any>(null);

export function useIqacData() {
  const ctx = useContext(IqacContext);
  if (!ctx) throw new Error('useIqacData must be used within IqacDataProvider');
  return ctx;
}

// ── Offline fallback: static BAC IQAC data ────────────────────────────────────
const OFFLINE_IQAC_DATA = {
  overview: {
    naacGrade: 'B+',
    naacCGPA: '2.71',
    naacCycle: '3rd Cycle',
    naacYear: '2023',
    established: '1994',
    autonomyStatus: 'Autonomous Institution',
    affiliation: 'Bharathiar University, Coimbatore',
    ugcRecognition: 'UGC 2(f) & 12(B)',
    accreditationStatus: 'NAAC Accredited',
    isoStatus: 'ISO 9001:2015 Certified',
    nirf: 'NIRF Ranked Institution',
  },
  committee: {
    coordinator: 'Dr. P. Samuel Manoharan',
    coordinatorDesignation: 'Principal & IQAC Coordinator',
    members: [
      { name: 'Dr. V. Anitha', role: 'IQAC Director', designation: 'Associate Professor, Computer Science' },
      { name: 'Dr. K. Suresh', role: 'Academic Member', designation: 'HOD, Computer Science' },
      { name: 'Dr. M. Lakshmi', role: 'Academic Member', designation: 'HOD, Commerce' },
      { name: 'Mrs. S. Renuka', role: 'Administrative Member', designation: 'Office Superintendent' },
      { name: 'Mr. A. John', role: 'Industry Expert', designation: 'CTO, TechCorp India' },
      { name: 'Dr. R. Xavier', role: 'External Academic', designation: 'Professor, Bharathiar University' },
    ],
  },
  aqar: [
    {
      year: '2023-24', status: 'Submitted', submittedOn: '2024-11-20',
      downloadUrl: '/downloads/aqar-2023-24.pdf',
      highlights: ['NAAC 3rd Cycle Accreditation completed', 'New research labs inaugurated', 'MoU signed with 5 industry partners'],
    },
    {
      year: '2022-23', status: 'Submitted', submittedOn: '2023-10-15',
      downloadUrl: '/downloads/aqar-2022-23.pdf',
      highlights: ['NBA accreditation for CSE dept', 'International conference hosted', '3 faculty national awards'],
    },
    {
      year: '2021-22', status: 'Submitted', submittedOn: '2022-11-01',
      downloadUrl: '/downloads/aqar-2021-22.pdf',
      highlights: ['Post-pandemic academic recovery plan', 'Online learning infrastructure upgraded', 'NEP 2020 compliance initiated'],
    },
    {
      year: '2020-21', status: 'Submitted', submittedOn: '2021-10-30',
      downloadUrl: '/downloads/aqar-2020-21.pdf',
      highlights: ['COVID-19 response & online continuity', 'Digital library resources expanded', 'Placement record despite pandemic'],
    },
  ],
  ssr: [
    { cycle: '3rd Cycle', year: '2023', grade: 'B+', cgpa: '2.71', downloadUrl: '/downloads/ssr-3rd-cycle-2023.pdf' },
    { cycle: '2nd Cycle', year: '2017', grade: 'B',  cgpa: '2.52', downloadUrl: '/downloads/ssr-2nd-cycle-2017.pdf' },
    { cycle: '1st Cycle', year: '2011', grade: 'B',  cgpa: '',     downloadUrl: '/downloads/ssr-1st-cycle-2011.pdf' },
  ],
  sss: {
    year: '2023-24',
    overallScore: 78.4,
    categories: [
      { label: 'Teaching & Learning',         score: 82 },
      { label: 'Infrastructure & Facilities', score: 76 },
      { label: 'Placement & Career Support',  score: 85 },
      { label: 'Library & Digital Resources', score: 74 },
      { label: 'Extracurricular Activities',  score: 79 },
      { label: 'Hostel & Campus Life',        score: 71 },
    ],
  },
  initiatives: [
    {
      title: 'Outcome-Based Education (OBE)',
      description: 'Implemented CBCS-OBE framework across all UG and PG programs with defined Programme Outcomes, Course Outcomes, and Program Specific Outcomes.',
      year: '2022', status: 'Ongoing',
    },
    {
      title: 'Green Campus Initiative',
      description: 'Solar panels, rainwater harvesting, and a campus-wide plastic-free policy under the Green Ambrose programme.',
      year: '2023', status: 'Ongoing',
    },
    {
      title: 'Mentor-Mentee Program',
      description: 'Each faculty mentors 15–20 students for academic, personal, and career guidance throughout their degree.',
      year: '2021', status: 'Ongoing',
    },
    {
      title: 'Industry-Academia MoUs',
      description: 'Active MoUs with TCS, Infosys, Wipro, NIIT, and 10+ regional industries for internships, guest lectures, and placement drives.',
      year: '2024', status: 'Active',
    },
    {
      title: 'Research & Innovation Cell',
      description: 'Dedicated cell to promote student and faculty research projects, patent filing, and national/international conference participation.',
      year: '2023', status: 'Active',
    },
    {
      title: 'NEP 2020 Implementation',
      description: 'Multidisciplinary courses, skill-based electives, and value-added certificate programs aligned with National Education Policy 2020.',
      year: '2024', status: 'In Progress',
    },
  ],
  documents: [
    { title: 'NAAC Peer Team Report — 3rd Cycle (2023)', category: 'NAAC',     fileUrl: '/downloads/naac-peer-report-2023.pdf', fileSize: '3.2 MB' },
    { title: 'AQAR 2023-24',                             category: 'AQAR',     fileUrl: '/downloads/aqar-2023-24.pdf',          fileSize: '4.2 MB' },
    { title: 'AQAR 2022-23',                             category: 'AQAR',     fileUrl: '/downloads/aqar-2022-23.pdf',          fileSize: '3.8 MB' },
    { title: 'Self Study Report — 3rd Cycle',            category: 'SSR',      fileUrl: '/downloads/ssr-3rd-cycle-2023.pdf',    fileSize: '12.5 MB' },
    { title: 'Academic Calendar 2024-25',                category: 'Academic', fileUrl: '/downloads/academic-calendar-2024.pdf',fileSize: '1.1 MB' },
    { title: 'UGC Autonomy Extension Order',             category: 'Autonomous',fileUrl: '/downloads/ugc-autonomy-order.pdf',   fileSize: '1.9 MB' },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

export function IqacDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const json = await apiClient.get<any>('/iqac');
      setData(json);
      setError(null);
    } catch (err: any) {
      // Backend unavailable — use static offline data so the page renders correctly
      console.info('[IQAC] Backend not available, using offline fallback data.');
      setData((prev: any) => prev || OFFLINE_IQAC_DATA);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateSection = async (section: string, sectionData: any) => {
    try {
      await apiClient.put(`/iqac/section/${section}`, sectionData);
      await refresh();
      return true;
    } catch (e) {
      console.error('updateSection error:', e);
      return false;
    }
  };

  const recordDownload = async (section: string, id: string) => {
    try {
      await apiClient.post(`/iqac/download/${section}/${id}`);
    } catch (e) {
      console.warn('recordDownload failed:', e);
    }
  };

  return (
    <IqacContext.Provider value={{ data, loading, error, refresh, updateSection, recordDownload }}>
      {children}
    </IqacContext.Provider>
  );
}
