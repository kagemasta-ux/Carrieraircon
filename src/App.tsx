import React, { useState, useEffect } from 'react';
import {
  Wind,
  Snowflake,
  MapPin,
  Building,
  Phone,
  Clock,
  FileText,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronRight,
  Menu,
  X,
  Send,
  Mail,
  Plus,
  LogIn,
  LogOut,
  Check,
  Globe,
  Trash2,
  Settings,
  BarChart2,
  Shield,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';

import { KakaoMap } from './components/KakaoMap';
import * as XLSX from 'xlsx';

// Product Catalog Data
interface Product {
  id: string;
  name: string;
  model: string;
  category: 'residential' | 'commercial' | 'system';
  image: string;
  area: string; // 냉난방 면적
  efficiency: string; // 에너지등급
  features: string[];
  specs: { cooling: string; heating?: string; power: string };
  isPopular?: boolean;
}

const CARRIER_PRODUCTS: Product[] = [
  {
    id: 'aer-18',
    name: '캐리어 에어로 18단 프리미엄 에어컨',
    model: 'KCD18-S33B',
    category: 'residential',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    area: '58.5㎡ (18평형)',
    efficiency: '1등급',
    features: ['18단계 맞춤 청정 위속바람', 'AI 스마트 자동 최적 냉방', 'UV-C LED 살균 청정 내부 필터'],
    specs: { cooling: '7.2 kW', power: '2.1 kW' },
    isPopular: true
  },
  {
    id: 'clar-06',
    name: '캐리어 클라윈드 초절전 벽걸이형',
    model: 'CSV-A061KL',
    category: 'residential',
    image: 'https://images.unsplash.com/photo-1585338111222-d48d7169f96f?auto=format&fit=crop&q=80&w=400',
    area: '18.7㎡ (6평형)',
    efficiency: '3등급',
    features: ['셀프 클리닝 자동 건조 시스템', '초절전 인버터 기술 탑재', '저소음 수면모드 및 습도조절'],
    specs: { cooling: '2.3 kW', power: '0.65 kW' }
  },
  {
    id: 'sys-34',
    name: '캐리어 Cassette 4way 천장형 인버터',
    model: 'KCV-A151MC',
    category: 'system',
    image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&q=80&w=400',
    area: '49.0㎡ (15평형)',
    efficiency: '1등급',
    features: ['3D 입체 간접 기류제어 사각지대 제로', '컴팩트 경량화 판넬 시공', '고양정 자동 배수 펌프'],
    specs: { cooling: '6.0 kW', heating: '7.2 kW', power: '1.8 kW' },
    isPopular: true
  },
  {
    id: 'com-80',
    name: '캐리어 중대형 상업용 인버터 패키지',
    model: 'KCD50-C14B',
    category: 'commercial',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400',
    area: '165㎡ (50평형)',
    efficiency: '1등급',
    features: ['원거리 급속 서라운드 터보 냉난방', '비틀림 방지 기어 및 고강도 날개', '에코 친환경 냉매 사용'],
    specs: { cooling: '14.5 kW', heating: '16.0 kW', power: '4.8 kW' }
  },
  {
    id: 'multi-v',
    name: '캐리어 홈멀티 시스템 세트 (실외기 단일형)',
    model: 'KCD25-M23C',
    category: 'system',
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=400',
    area: '각 방별 맞춤 (30평형 이상)',
    efficiency: '1등급',
    features: ['단 하나의 실외기로 방별 스마트 비례 제어', '스마트 전력 절감 인공지능 컨트롤', '저온 기후 대응 고확장성 압축기 적용'],
    specs: { cooling: '11.0 kW', power: '3.2 kW' }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'board' | 'about' | 'directions' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Board States
  const [posts, setPosts] = useState<any[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [verifyTargetPost, setVerifyTargetPost] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // New Post Form
  const [formCategory, setFormCategory] = useState<'quote' | 'general'>('quote');
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);

  // Admin States
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('carrier_admin_token'));
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminRepliesInput, setAdminRepliesInput] = useState('');
  const [adminEmailLogs, setAdminEmailLogs] = useState<any[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Quick show admin login panel
  const [isTermsOpen, setIsTermsOpen] = useState(false); // Terms of Use Modal
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // Privacy Policy Modal
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'settings' | 'products' | 'account'>('dashboard');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminPasswordStatus, setAdminPasswordStatus] = useState({ success: false, message: '' });

  const [adminKakaoKey, setAdminKakaoKey] = useState('');
  const [adminKakaoStatus, setAdminKakaoStatus] = useState({ success: false, message: '' });

  const fetchAdminKakaoKey = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/config/kakao', {
        headers: {
          'X-Admin-Token': adminToken || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setAdminKakaoKey(data.appKey || '');
      }
    } catch (err) {
      console.error('Failed to fetch admin Kakao Key config:', err);
    }
  };

  const handleAdminSaveKakaoKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKakaoStatus({ success: false, message: '' });
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/config/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ appKey: adminKakaoKey.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAdminKakaoStatus({ success: true, message: '카카오맵 API 앱 키가 성공적으로 저장되었습니다!' });
      } else {
        setAdminKakaoStatus({ success: false, message: data.message || '저장 실패' });
      }
    } catch {
      setAdminKakaoStatus({ success: false, message: '서버와 연결할 수 없습니다.' });
    }
  };

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordStatus({ success: false, message: '' });
    if (!adminNewPassword || adminNewPassword.trim().length < 4) {
      setAdminPasswordStatus({ success: false, message: '비밀번호는 최소 4글자 이상이어야 합니다.' });
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ password: adminNewPassword.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAdminPasswordStatus({ success: true, message: '관리자 접속 비밀 패스코드가 성공적으로 변경되었습니다!' });
        setAdminNewPassword('');
      } else {
        setAdminPasswordStatus({ success: false, message: data.message || '비밀번호 변경 실패' });
      }
    } catch {
      setAdminPasswordStatus({ success: false, message: '서버와 연결할 수 없습니다.' });
    }
  };

  // Excel Bulk Upload States & Handlers
  const [excelFileRows, setExcelFileRows] = useState<any[] | null>(null);
  const [excelIsUploading, setExcelIsUploading] = useState(false);
  const [excelStatusMsg, setExcelStatusMsg] = useState({ success: false, message: '' });

  const handleDownloadExcelTemplate = () => {
    // Columns definition
    const headers = [
      '제품명', '모델명', '분류', '설치면적', '에너지등급', '이미지URL', '특징들(쉼표로구분)', '냉방능력', '난방능력', '소비전력', '인기기종(O또는비워둠)'
    ];
    
    // Sample data
    const rows = [
      [
        '캐리어 에어로 18단 프리미엄 에어컨',
        'KCD18-S33B',
        '가정용',
        '58.5㎡ (18평형)',
        '1등급',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
        '18단계 맞춤 청정 위속바람, AI 스마트 자동 최적 냉방, UV-C LED 살균 청정 내부 필터',
        '7.2 kW',
        '6.5 kW',
        '2.1 kW',
        'O'
      ],
      [
        '캐리어 세미시스템 멀티형 에어컨',
        'KCV-M120',
        '시스템/멀티',
        '115.5㎡ (35평형)',
        '2등급',
        'https://images.unsplash.com/photo-1585338111222-d48d7169f96f?auto=format&fit=crop&q=80&w=400',
        '공간 맞춤형 슬림 패널, 초고효율 인버터 팬 적용',
        '14.5 kW',
        '16.0 kW',
        '4.5 kW',
        ''
      ],
      [
        '상업용 초정밀 스탠드 대형 냉방기',
        'KCP-D83A',
        '상업 대용량',
        '190.0㎡ (58평형)',
        '3등급',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
        '초강력 냉방 풍속 조절, 전면부 풀컬러 디스플레이',
        '23.0 kW',
        '',
        '7.8 kW',
        'O'
      ]
    ];

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Carrier Products');
    XLSX.writeFile(wb, '캐리어_에어컨_제품등록_양식.xlsx');
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelStatusMsg({ success: false, message: '' });
    setExcelFileRows(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr) return;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (data.length < 2) {
          setExcelStatusMsg({ success: false, message: '엑셀 파일에 유효한 데이터 행이 존재하지 않습니다.' });
          return;
        }

        const headers = data[0].map(h => String(h || '').trim());
        const jsonRows: any[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row.some(Boolean)) continue; // skip empty rows

          const rowData: any = {};
          headers.forEach((header, idx) => {
            rowData[header] = row[idx] !== undefined ? row[idx] : '';
          });

          const name = rowData['제품명'] || '';
          const model = rowData['모델명'] || '';
          if (!name || !model) continue;

          jsonRows.push({
            name,
            model,
            category: rowData['분류'] || '가정용',
            area: rowData['설치면적'] || rowData['면적'] || '',
            efficiency: rowData['에너지등급'] || rowData['등급'] || '일반등급',
            image: rowData['이미지URL'] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
            features: rowData['특징들(쉼표로구분)'] || rowData['특징들'] || '',
            cooling: rowData['냉방능력'] || '',
            heating: rowData['난방능력'] || '',
            power: rowData['소비전력'] || '',
            isPopular: String(rowData['인기기종(O또는비워둠)'] || rowData['인기기종'] || rowData['베스트'] || '').trim().toUpperCase() === 'O'
          });
        }

        if (jsonRows.length === 0) {
          setExcelStatusMsg({ success: false, message: '유효한 제품명 및 모델명을 기재한 유효 행을 발견하지 못했습니다.' });
        } else {
          setExcelFileRows(jsonRows);
          setExcelStatusMsg({ success: true, message: `총 ${jsonRows.length}개의 제품 정보 행을 성공적으로 읽어왔습니다. 아래에서 리스트 검토 후 [벌크 업로드 최종 실행] 버튼을 선택해 주세요.` });
        }
      } catch (err: any) {
        setExcelStatusMsg({ success: false, message: `엑셀 파싱 중 오류가 발생했습니다: ${err.message}` });
      }
    };
    reader.readAsBinaryString(file);
    
    // Clear input value so that the same file can be loaded again if needed
    e.target.value = '';
  };

  const handleConfirmExcelBulkUpload = async () => {
    if (!excelFileRows || excelFileRows.length === 0) return;
    setExcelIsUploading(true);
    setExcelStatusMsg({ success: false, message: '' });

    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ products: excelFileRows })
      });
      const data = await res.json();
      if (data.success) {
        setExcelStatusMsg({
          success: true,
          message: `🎉 성공: 총 ${data.count}개의 신규 제품이 대유입되어 일괄 등록 및 데이터베이스 저장이 최종 완료되었습니다!`
        });
        setExcelFileRows(null);
        fetchProducts();
      } else {
        setExcelStatusMsg({ success: false, message: data.message || '일괄 업로드 처리 중 오류가 발생했습니다.' });
      }
    } catch {
      setExcelStatusMsg({ success: false, message: '네트워크 통신망 상태가 나쁘거나 서버에서 오류를 수령했습니다.' });
    } finally {
      setExcelIsUploading(false);
    }
  };

  // Site settings state for editable texts (Aesthetic & general message persistence)
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: localStorage.getItem('carrier_setting_logoUrl') || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Carrier_logo.svg/320px-Carrier_logo.svg.png",
    ceoName: localStorage.getItem('carrier_setting_ceoName') || "캐리어에어컨 성남총판 / 안영원 대표",
    aboutIntroText: localStorage.getItem('carrier_setting_aboutIntroText') || "인류 최초 에어컨 발명자 윌리스 캐리어의 후속 120년 정통 공조 기술 명망을 닻삼아, 한 치 거짓 없는 규격 동자재와 최선 선진 연산 치수로 완벽 시공을 사명으로 실천하는 정직한 캐리어에어컨 성남총판입니다.",
    footerAddress: localStorage.getItem('carrier_setting_footerAddress') || "경기도 성남시 수정구 성남대로 1247, 1층 캐리어에어컨 성남총판",
    footerPhone: localStorage.getItem('carrier_setting_footerPhone') || "1588-6883",
    footerEmail: localStorage.getItem('carrier_setting_footerEmail') || "01carrier@hanmail.net",
    footerDisclaimer: localStorage.getItem('carrier_setting_footerDisclaimer') || "본 홈페이지는 캐리어에어컨 기기 납품 및 시공 설계 견적 성함을 인계받아 책임 이첩하는 비회원 안심 전산망입니다. 수집된 최소 작성번호는 4자리 본인 매칭 이외의 목적으로 제3자 제공이나 누출이 일체 봉쇄됩니다.",
    heroTitle: localStorage.getItem('carrier_setting_heroTitle') || "120년 냉동공조 기술력, \n캐리어에어컨 성남총판",
    heroSub: localStorage.getItem('carrier_setting_heroSub') || "법인 및 상업 시설 완벽 특화 최적 설계! 에너지효율은 극한으로 올리고 오차 없는 밀착 시공을 도모합니다.",
    businessRegNo: localStorage.getItem('carrier_setting_businessRegNo') || "120-81-01185",
    hideProducts: localStorage.getItem('carrier_setting_hideProducts') === null ? "true" : localStorage.getItem('carrier_setting_hideProducts')
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMessage, setSettingsSaveMessage] = useState('');

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSiteSettings(data.settings);
        Object.entries(data.settings).forEach(([key, value]) => {
          localStorage.setItem(`carrier_setting_${key}`, String(value));
        });
      }
    } catch (err) {
      console.error('Failed to load site settings from backend', err);
    }
  };

  const updateSiteSettings = (newSettings: Partial<typeof siteSettings>) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);
    setSettingsSaveMessage('');
    Object.entries(newSettings).forEach(([key, value]) => {
      localStorage.setItem(`carrier_setting_${key}`, String(value));
    });
  };

  const saveSiteSettingsToServer = async () => {
    setIsSavingSettings(true);
    setSettingsSaveMessage('');
    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify(siteSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaveMessage('✓ 사이트 설정 정보가 성공적으로 서버와 데이터베이스에 영구 저장 및 동기화되었습니다!');
      } else {
        setSettingsSaveMessage(`❌ 저장 실패: ${data.message || '오류가 발생했습니다.'}`);
      }
    } catch (err) {
      console.error(err);
      setSettingsSaveMessage('❌ 서버 연결 실패. 네트워크 연결을 확인하세요.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Migrate old browser localStorage values to new defaults automagically
  useEffect(() => {
    const oldCeo = localStorage.getItem('carrier_setting_ceoName');
    const oldIntro = localStorage.getItem('carrier_setting_aboutIntroText');
    const oldPhone = localStorage.getItem('carrier_setting_footerPhone');
    const oldEmail = localStorage.getItem('carrier_setting_footerEmail');
    const oldHeroTitle = localStorage.getItem('carrier_setting_heroTitle');

    let needsUpdate = false;
    const updates: Partial<typeof siteSettings> = {};

    if (!oldCeo || oldCeo.includes('이기영') || oldCeo.includes('시공 케어 파트너')) {
      updates.ceoName = "캐리어에어컨 성남총판 / 안영원 대표";
      needsUpdate = true;
    }
    if (!oldIntro || oldIntro.includes('정식 공식 파트너입니다') || oldIntro.includes('공식 파트너')) {
      updates.aboutIntroText = "인류 최초 에어컨 발명자 윌리스 캐리어의 후속 120년 정통 공조 기술 명망을 닻삼아, 한 치 거짓 없는 규격 동자재와 최선 선진 연산 치수로 완벽 시공을 사명으로 실천하는 정직한 캐리어에어컨 성남총판입니다.";
      needsUpdate = true;
    }
    if (!oldPhone || oldPhone === '1588-1234') {
      updates.footerPhone = "1588-6883";
      needsUpdate = true;
    }
    if (!oldEmail || oldEmail === 'kagemasta@gmail.com') {
      updates.footerEmail = "01carrier@hanmail.net";
      needsUpdate = true;
    }
    if (!oldHeroTitle || oldHeroTitle.includes('캐리어에어컨 파트너') || oldHeroTitle.includes('공식 파트너')) {
      updates.heroTitle = "120년 냉동공조 기술력, \n캐리어에어컨 성남총판";
      needsUpdate = true;
    }

    if (needsUpdate) {
      setSiteSettings(prev => {
        const u = { ...prev, ...updates };
        Object.entries(updates).forEach(([k, v]) => {
          localStorage.setItem(`carrier_setting_${k}`, String(v));
        });
        return u;
      });
    }
  }, []);



  // Products list state with initial CARRIER_PRODUCTS fallback
  const [products, setProducts] = useState<Product[]>(CARRIER_PRODUCTS);

  // Product management states (Admin only)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // if null, we are creating
  const [prodName, setProdName] = useState('');
  const [prodModel, setProdModel] = useState('');
  const [prodCategory, setProdCategory] = useState<'residential' | 'commercial' | 'system'>('residential');
  const [prodImage, setProdImage] = useState('');
  const [prodArea, setProdArea] = useState('');
  const [prodEfficiency, setProdEfficiency] = useState('1등급');
  const [prodFeatures, setProdFeatures] = useState(''); // comma-separated
  const [prodCooling, setProdCooling] = useState('');
  const [prodHeating, setProdHeating] = useState('');
  const [prodPower, setProdPower] = useState('');
  const [prodIsPopular, setProdIsPopular] = useState(false);

  // Load posts and products on mount
  useEffect(() => {
    fetchSiteSettings();
    fetchPosts();
    fetchProducts();
    if (adminToken) {
      fetchAdminKakaoKey();
    }
  }, [adminToken]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdModel('');
    setProdCategory('residential');
    setProdImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400');
    setProdArea('');
    setProdEfficiency('1등급');
    setProdFeatures('');
    setProdCooling('');
    setProdHeating('');
    setProdPower('');
    setProdIsPopular(false);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdModel(p.model);
    setProdCategory(p.category);
    setProdImage(p.image);
    setProdArea(p.area);
    setProdEfficiency(p.efficiency);
    setProdFeatures(p.features.join(', '));
    setProdCooling(p.specs?.cooling || '');
    setProdHeating(p.specs?.heating || '');
    setProdPower(p.specs?.power || '');
    setProdIsPopular(!!p.isPopular);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const payload = {
      name: prodName,
      model: prodModel,
      category: prodCategory,
      image: prodImage,
      area: prodArea,
      efficiency: prodEfficiency,
      features: prodFeatures.split(',').map(f => f.trim()).filter(Boolean),
      specs: {
        cooling: prodCooling,
        heating: prodHeating || undefined,
        power: prodPower
      },
      isPopular: prodIsPopular
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(editingProduct ? '제품이 성공적으로 수정되었습니다.' : '제품이 성공적으로 등록되었습니다.');
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        alert(data.message || '제품 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!adminToken) return;
    if (!confirm('정말로 이 제품을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('제품이 삭제되었습니다.');
        fetchProducts();
      } else {
        alert(data.message || '삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  const fetchPosts = async () => {
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }
      const res = await fetch('/api/posts', { headers });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('carrier_admin_token', data.token);
        setAdminToken(data.token);
        setAdminPasswordInput('');
        setIsAdminOpen(false);
        setActiveTab('admin');
        fetchPosts();
        fetchEmailLogs(data.token);
      } else {
        setAdminLoginError(data.message || '비밀번호 전송 오류');
      }
    } catch {
      setAdminLoginError('서버 통신 실패');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('carrier_admin_token');
    setAdminToken(null);
    setAdminEmailLogs([]);
    setActiveTab('home');
    fetchPosts();
  };

  const fetchEmailLogs = async (token: string) => {
    try {
      const res = await fetch('/api/admin/emails', {
        headers: { 'X-Admin-Token': token }
      });
      const data = await res.json();
      if (data.success) {
        setAdminEmailLogs(data.emails);
      }
    } catch (err) {
      console.error('Failed to fetch email logs', err);
    }
  };

  // Trigger emails fetch if already logged in initially
  useEffect(() => {
    if (adminToken) {
      fetchEmailLogs(adminToken);
    }
  }, [adminToken]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyConsent) {
      alert('개인정보 수집 및 이용에 동의해야 합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory,
          title: formTitle,
          author: formAuthor,
          content: formContent,
          contact: formContact,
          email: formEmail,
          product: formProduct,
          password: formPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data);
        // Reset Form
        setFormTitle('');
        setFormAuthor('');
        setFormContent('');
        setFormContact('');
        setFormEmail('');
        setFormProduct('');
        setFormPassword('');
        setPrivacyConsent(false);
        fetchPosts();
      } else {
        alert(data.message || '게시글 등록에 실패했습니다.');
      }
    } catch {
      alert('서버와 통신하는 도중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }
      const res = await fetch(`/api/posts/${verifyTargetPost.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.post);
        setVerifyTargetPost(null);
        setPasswordInput('');
      } else {
        setVerifyError(data.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setVerifyError('서버 통신 실패');
    }
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(null); // Clear previous detail first
    if (adminToken) {
      // Admin bypasses verification
      setVerifyTargetPost(post);
      fetchFullPostForAdmin(post.id);
    } else {
      setVerifyTargetPost(post);
      setPasswordInput('');
      setVerifyError('');
    }
  };

  const fetchFullPostForAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || ''
        },
        body: JSON.stringify({ password: '' })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.post);
        setVerifyTargetPost(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminReplySubmit = async (e: React.FormEvent, statusChange?: string) => {
    e.preventDefault();
    if (!adminToken || !selectedPost) return;

    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          content: adminRepliesInput,
          status: statusChange || 'completed'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.post);
        setAdminRepliesInput('');
        fetchPosts();
        alert('답변 및 문의 처리가 등록되었습니다.');
      }
    } catch {
      alert('오류 발생');
    }
  };

  const handleDeletePost = async (postId: string, bypassPassword = false) => {
    const pass = bypassPassword ? '' : prompt('게시글 삭제 비밀번호를 입력해주세요.');
    if (!bypassPassword && pass === null) return;

    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (data.success) {
        alert('삭제가 완료되었습니다.');
        setSelectedPost(null);
        fetchPosts();
      } else {
        alert(data.message || '인증 비밀번호가 잘못되었습니다.');
      }
    } catch {
      alert('삭제 도중 통신 오류가 발생했습니다.');
    }
  };

  const startInquiryForProduct = (productName: string) => {
    setFormProduct(productName);
    setFormCategory('quote');
    setFormTitle(`[제품 견적 요청] ${productName}`);
    setActiveTab('board');
    setIsWriteModalOpen(true);
  };



  return (
    <div id="carrier_site_root" className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1. Header & Navigation */}
      <header id="header_container" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            {siteSettings.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt="Carrier Logo" 
                className="h-7 md:h-10 object-contain" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl font-black tracking-wider text-[#002D62]">CARRIER</span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav id="desktop_nav" className="hidden md:flex items-center gap-6">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-[#002D62] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              홈
            </button>
            {siteSettings.hideProducts !== "true" && (
              <button
                onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'products' ? 'text-[#002D62] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                제품 소개
              </button>
            )}
            <button
              onClick={() => { setActiveTab('board'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'board' ? 'text-[#002D62] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              견적 및 문의
            </button>
            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'about' ? 'text-[#002D62] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              회사 소개
            </button>
            <button
              onClick={() => { setActiveTab('directions'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'directions' ? 'text-[#002D62] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              오시는 길
            </button>

            {adminToken ? (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                온라인 제어판
              </button>
            ) : null}
          </nav>

          {/* Call / Action items */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={`tel:${siteSettings.footerPhone}`} className="text-sm font-semibold text-[#002D62] flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>{siteSettings.footerPhone}</span>
            </a>
            {adminToken ? (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1 py-1.5 px-3 bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>관리자 로그아웃</span>
              </button>
            ) : null}
          </div>

          {/* Mobile responsive toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 absolute top-18 left-0 w-full shadow-lg p-4 flex flex-col gap-2 z-50">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'home' ? 'bg-slate-100 text-[#002D62]' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              홈
            </button>
            {siteSettings.hideProducts !== "true" && (
              <button
                onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'products' ? 'bg-slate-100 text-[#002D62]' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                제품 소개
              </button>
            )}
            <button
              onClick={() => { setActiveTab('board'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'board' ? 'bg-slate-100 text-[#002D62]' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              견적 및 문의
            </button>
            <button
              onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'about' ? 'bg-slate-100 text-[#002D62]' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              회사 소개
            </button>
            <button
              onClick={() => { setActiveTab('directions'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'directions' ? 'bg-slate-100 text-[#002D62]' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              오시는 길
            </button>

            {adminToken && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left py-3 px-4 rounded-lg font-bold bg-red-50 text-red-700 flex items-center gap-1"
              >
                온라인 제어판 (관리자 전용)
              </button>
            )}

            <div className="h-px bg-slate-100 my-2"></div>
            <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500">
              <a href={`tel:${siteSettings.footerPhone}`} className="flex items-center gap-1.5 font-bold text-[#002D62] hover:underline">
                <Phone className="w-4 h-4 text-sky-600" /> {siteSettings.footerPhone}
              </a>
              {adminToken && (
                <button onClick={handleAdminLogout} className="text-xs text-red-600 underline">로그아웃</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Core View Router */}
      <main className="flex-grow">
        
        {/* VIEW: HOME */}
        {activeTab === 'home' && (
          <div id="home_view_wrapper" className="animate-fade-in">
            {/* Hero Interactive Banner */}
            <section className="bg-gradient-to-r from-[#002D62] via-[#0F3F7A] to-[#1E5691] text-white py-16 md:py-24 px-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.2),transparent_50%)]"></div>
              <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center space-y-6">
                <div className="space-y-6 flex flex-col items-center">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md py-1 px-3 rounded-full text-sky-200 text-xs font-bold border border-white/10 uppercase tracking-widest">
                    <Wind className="w-3.5 h-3.5 text-sky-400" /> Carrier HVAC Expert Solution
                  </div>
                  <h1 className="text-3.5xl md:text-5xl font-black leading-tight tracking-tight whitespace-pre-line">
                    {siteSettings.heroTitle}
                  </h1>
                  <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-2xl">
                    {siteSettings.heroSub}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {siteSettings.hideProducts !== "true" && (
                      <button
                        onClick={() => setActiveTab('products')}
                        className="px-6 py-3 bg-white text-[#002D62] font-semibold rounded-lg hover:bg-sky-50 shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <span>제품 카탈로그 보기</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setActiveTab('board'); setIsWriteModalOpen(true); }}
                      className="px-6 py-3 bg-sky-600/35 hover:bg-sky-600/50 text-white font-semibold rounded-lg border border-sky-400/30 transition-all text-sm"
                    >
                      온라인 무료 견적서 접수
                    </button>
                  </div>
                </div>
              </div>
            </section>



            {/* Showcase Section */}
            <section className="bg-slate-100/60 py-16 px-4">
              <div className="max-w-7xl mx-auto space-y-10">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-2.5xl font-extrabold text-[#002D62] tracking-tight">가장 먼저 문의받는 베스트셀러</h2>
                  <p className="text-slate-500 text-sm">실제 고객님들이 가장 빈번하게 납품을 의뢰하는 대표 캐리어 에어컨 기종입니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.filter(p => p.isPopular).map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-[#002D62] text-white text-xs px-2.5 py-1 rounded-full font-bold">인기 기종</span>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-500 uppercase">{p.category === 'system' ? '천장형 시스템' : '스탠드 가정용'}</span>
                          <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                          <span className="text-slate-500 text-xs font-semibold">모델명 : {p.model}</span>
                          <div className="pt-2 flex flex-wrap gap-1">
                            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">효율: {p.efficiency}</span>
                            <span className="text-[11px] bg-sky-50 text-[#002D62] px-2 py-0.5 rounded">적용 면적: {p.area}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex gap-2">
                          <button
                            onClick={() => startInquiryForProduct(p.name)}
                            className="w-full py-2 bg-gradient-to-r from-[#002D62] to-[#0F3F7A] hover:opacity-90 text-white text-xs font-bold rounded-lg transition-opacity flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" /> 견적 요청하기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-gradient-to-br from-[#0F3F7A]/10 to-sky-500/5 p-6 rounded-xl border border-[#0F3F7A]/10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-[#002D62] tracking-wider uppercase bg-white/60 inline-block px-2.5 py-1 rounded-full">실제 시공 보증제</span>
                      <h3 className="font-bold text-[#002D62] text-lg">설치 공간에 맞는 최적 견적이 고민이신가요?</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        공간의 구조, 용도, 단열도 상태에 따라 요구 기냉 용량이 완전히 달라집니다. 비회원 비밀 글 게시판에 가벼운 문의만 기재해 주시면, 마스터 공학 설계진이 신속 정성껏 회신해 드립니다.
                      </p>
                    </div>

                    <button
                      onClick={() => { setActiveTab('board'); setIsWriteModalOpen(true); }}
                      className="w-full py-2.5 bg-white border border-[#002D62]/20 hover:bg-[#002D62]/5 text-[#002D62] text-xs font-bold rounded-lg transition-colors mt-6"
                    >
                      상담하기 (비회원 등록 가능)
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: PRODUCTS */}
        {activeTab === 'products' && siteSettings.hideProducts !== "true" && (
          <div id="products_view_container" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-6 gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-[#002D62] tracking-tight">제품 소개 및 라인업</h1>
                <p className="text-slate-500 text-sm">개인용 원룸 주택부터 주상복합 천장 사각 멀티 시스템, 대용량 상업시설 대형 냉난방기까지 정품 캐리어 완벽 대응 라인업입니다.</p>
              </div>
              {adminToken && (
                <button
                  onClick={openAddProductModal}
                  className="px-5 py-2.5 bg-[#002D62] hover:bg-[#002D62]/95 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 text-sm cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> 신규 제품 사진 및 설명 등록
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 bg-[#0F3F7A] text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {p.category === 'residential' ? '가정용' : p.category === 'commercial' ? '고용량 상업용' : '시스템/멀티'}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">MODEL. {p.model}</span>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{p.name}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">에너지 소비 등급</span>
                          <span className="text-emerald-700 font-bold">{p.efficiency}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">추천 냉난방 면적</span>
                          <span className="text-[#002D62] font-bold">{p.area}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-bold text-slate-700 block">핵심 기능요약:</span>
                        <ul className="space-y-1">
                          {p.features.map((f, i) => (
                            <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                              <span className="text-sky-500 select-none mt-0.5">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-2">
                    <button
                      onClick={() => startInquiryForProduct(p.name)}
                      className="w-full py-2 bg-[#002D62] hover:bg-[#002D62]/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> 특가 견적 무료 요청하기
                    </button>

                    {adminToken && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 transition-colors"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-lg border border-red-200 transition-colors"
                        >
                          삭제하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: BOARD (Quotes & General Inquiry Board) */}
        {activeTab === 'board' && (
          <div id="board_view_container" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-[#002D62] tracking-tight">온라인 견적요청 및 일반문의</h1>
                <p className="text-slate-500 text-sm">개인정보 보호를 위해 비회원 비밀글 작성을 지원합니다. 등록하신 뒤 자가 비밀번호로 언제든 열람할 수 있습니다.</p>
              </div>
              <button
                onClick={() => { setSubmitSuccess(null); setIsWriteModalOpen(true); }}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:opacity-95 text-white font-bold rounded-lg shadow-sm font-semibold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> 새로운 비밀 문의 등록
              </button>
            </div>

            {/* Board List Grid Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6 text-center w-16">No</th>
                      <th className="py-4 px-6">문의 사항 (클릭하여 열람)</th>
                      <th className="py-4 px-6 w-32">작성자</th>
                      <th className="py-4 px-6 w-40">등록자 등록일</th>
                      <th className="py-4 px-6 w-28 text-center font-semibold">처리 현황</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium font-sans">
                          등록된 문의글이 없습니다. 첫 번째 문의를 작성해 보세요!
                        </td>
                      </tr>
                    ) : (
                      posts.map((post, idx) => (
                        <tr
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className="hover:bg-sky-50/45 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-6 text-center text-slate-400 text-xs">
                            {posts.length - idx}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span className="hover:underline truncate">{post.title}</span>
                              <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              {post.replyCount > 0 && (
                                <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                                  답변 (+{post.replyCount})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                            {post.author.substring(0, 1) + '*' + (post.author.length > 2 ? post.author.substring(post.author.length - 1) : '*')}
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded ${
                              post.status === 'completed'
                                ? 'bg-[#00DDA4]/10 text-emerald-700'
                                : post.status === 'reviewing'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {post.status === 'completed' ? '답변완료' : post.status === 'reviewing' ? '검토중' : '답변대기'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Password Verification Drawer / Small Box */}
            {verifyTargetPost && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#002D62]" /> 비밀번호 본인 인증
                    </h3>
                    <button onClick={() => setVerifyTargetPost(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    작성 당시에 입력하셨던 4자리 비밀번호 또는 관리자 임시 패스코드를 입력해 주세요.
                  </p>

                  <form onSubmit={handleVerifyPassword} className="space-y-3">
                    <div>
                      <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm font-bold tracking-widest text-center"
                        required
                        autoFocus
                      />
                    </div>
                    {verifyError && (
                      <p className="text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {verifyError}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerifyTargetPost(null)}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        입력 완료
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Read Complete Selected Post Drawer */}
            {selectedPost && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in">
                <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
                  <div className="divide-y divide-slate-100">
                    {/* Header Controls */}
                    <div className="p-6 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {adminToken && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                              관리자 권한 열람 중
                            </span>
                          )}
                          {!adminToken && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                              비밀번호 인증 완료
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPost.title}</h2>
                      </div>
                      <button
                        onClick={() => setSelectedPost(null)}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Metadata Specs */}
                    <div className="p-6 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">성함/상호명</span>
                        <span className="text-slate-900 font-bold">{selectedPost.author}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">등록 날짜</span>
                        <span className="text-slate-900 font-bold">
                          {new Date(selectedPost.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">연락처</span>
                        <span className="text-[#002D62] font-bold">{selectedPost.contact || '미입력'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">이메일</span>
                        <span className="text-slate-900 font-bold">{selectedPost.email || '미입력'}</span>
                      </div>
                    </div>

                    {/* Content text */}
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-xs text-slate-400 block mb-2 font-bold uppercase">문의 내용 본문</span>
                        <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {selectedPost.content}
                        </div>
                      </div>

                      {/* Client replies display */}
                      <div className="space-y-3 pt-4">
                        <span className="text-xs text-slate-400 block font-bold border-b border-slate-100 pb-1 uppercase">
                          전담 시공 마스터 답변 피드백
                        </span>
                        {selectedPost.replies && selectedPost.replies.length > 0 ? (
                          selectedPost.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-[#002D62]/5 p-4 rounded-xl border border-[#002D62]/10 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#002D62] flex items-center gap-1">
                                  <Snowflake className="w-3.5 h-3.5 text-[#002D62]" /> 캐리어에어컨 성남총판 대표마스터
                                </span>
                                <span className="text-slate-400">
                                  {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                                {reply.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-center text-slate-400 py-3 bg-slate-50 rounded-lg">
                            대표 마스터가 해당 문의를 검토하고 있습니다. 신속 정확하게 이메일/전화와 함께 서면 답변 메가 가이드라인을 송신해 드립니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Admin tool to reply or general user deletion) */}
                  <div className="p-6 bg-slate-50 border-t border-slate-200">
                    {adminToken ? (
                      <form onSubmit={(e) => handleAdminReplySubmit(e, 'completed')} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">관리자 전용 즉시 인라인 답변달기</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleAdminReplySubmit(e, 'reviewing')}
                              className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded hover:opacity-80 transition-opacity"
                            >
                              처리중(검토) 설정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(selectedPost.id, true)}
                              className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded hover:opacity-80 transition-opacity flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> 강제삭제
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            placeholder="공식 소견 및 예상 견적 금액, 자재 대금 설계 내역을 기입하세요."
                            value={adminRepliesInput}
                            onChange={(e) => setAdminRepliesInput(e.target.value)}
                            className="flex-grow border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                            rows={3}
                            required
                          />
                          <button
                            type="submit"
                            className="px-4 bg-[#002D62] hover:bg-[#002D62]/90 text-white rounded-lg text-xs font-bold flex flex-col items-center justify-center"
                          >
                            <span>답변</span>
                            <span>등록</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeletePost(selectedPost.id)}
                          className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 비밀글 삭제하기
                        </button>
                        <button
                          onClick={() => setSelectedPost(null)}
                          className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          창 닫기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WRITE INQUIRY MODAL OVERLAY */}
            {isWriteModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                  
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-[#002D62]">비회원 안심 문의글 등록</h2>
                      <p className="text-[11px] text-slate-500">정찰 단가 대입 정보와 숙련 기술진 시공 부하 상담을 지원합니다.</p>
                    </div>
                    <button
                      onClick={() => setIsWriteModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {submitSuccess ? (
                    <div className="p-8 text-center space-y-5 flex-grow">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900">문의가 접수되었습니다.</h3>
                      </div>

                      <button
                        onClick={() => { setIsWriteModalOpen(false); setSubmitSuccess(null); }}
                        className="px-6 py-2.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        목록으로 가기
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">성함/상호명 *</label>
                          <input
                            type="text"
                            placeholder="홍길동 (또는 상호명)"
                            value={formAuthor}
                            onChange={(e) => setFormAuthor(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold mb-1">비밀글 비밀번호 (4자리) *</label>
                          <input
                            type="password"
                            placeholder="설정 암호 4자리"
                            maxLength={4}
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-bold tracking-widest text-center"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">연락처</label>
                          <input
                            type="text"
                            placeholder="010-1234-5678"
                            value={formContact}
                            onChange={(e) => setFormContact(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold mb-1">답변 수신용 이메일</label>
                          <input
                            type="email"
                            placeholder="customer@email.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1">문의 제목 *</label>
                        <input
                          type="text"
                          placeholder="가산동 소형 사무가동 천장 세라믹 3way 시공대금 견적 의뢰드립니다."
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1">문의 내용 *</label>
                        <textarea
                          placeholder="설치 공간의 상세 용도(가정/상가), 실내외 거리, 건물 평형 정보를 인계해주시면 더욱 정확한 사전 견적이 도출됩니다."
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="consent_check"
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)}
                          className="mt-0.5 accent-indigo-600 scale-105"
                          required
                        />
                        <label htmlFor="consent_check" className="text-[10px] text-slate-600 leading-relaxed cursor-pointer select-none">
                          <span className="font-bold text-indigo-900">[필수] 개인정보 수집 및 상담 이용 동의: </span>
                          제출해주신 기본 성함 및 이메일, 휴대전화 번호는 비회원 시공 견적 조율 및 사후 관리 기록 목적에 한하여 사용되며, 이용 종료 시 지체 없이 안전 파기됩니다.
                        </label>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsWriteModalOpen(false)}
                          className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-center text-xs"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-grow py-2.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold rounded-lg transition-colors text-center text-xs flex items-center justify-center gap-1"
                        >
                          {isSubmitting ? '서버 접수중...' : <><Send className="w-3.5 h-3.5" /> 시공 문의 접출</>}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: ABOUT (Company Introduction) */}
        {activeTab === 'about' && (
          <div id="about_view_container" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
              
              {/* 회사 소개 (좌측) */}
              <div className="lg:col-span-7 bg-gradient-to-br from-[#002D62] to-[#0F3F7A] text-white p-8 md:p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xs">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_40%)]"></div>
                <div className="space-y-4 relative z-10">
                  <span className="text-xs uppercase font-extrabold text-sky-300 bg-white/10 px-2.5 py-1 rounded inline-block">회사 소개</span>
                  <h1 className="text-2.5xl font-black tracking-tight leading-tight">캐리어에어컨 냉난방 공조 케어 솔루션</h1>
                  <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-line">
                    {siteSettings.aboutIntroText}
                  </p>
                </div>
              </div>

              {/* 사업자 개요 (우측) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-[#002D62] border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-sky-600" /> 캐리어에어컨 성남총판 사업자 개요
                  </h2>

                  <div className="grid grid-cols-1 gap-4 text-xs pt-3">
                    <div className="flex border-b border-slate-100 pb-3">
                      <span className="w-28 text-slate-400 font-bold">상호명 / 대표</span>
                      <span className="text-slate-800 font-bold">{siteSettings.ceoName}</span>
                    </div>
                    <div className="flex border-b border-slate-100 pb-3">
                      <span className="w-28 text-slate-400 font-bold">사업자등록번호</span>
                      <span className="text-slate-800 font-extrabold tracking-wide">{siteSettings.businessRegNo}</span>
                    </div>
                    <div className="flex border-b border-slate-100 pb-3">
                      <span className="w-28 text-slate-400 font-bold">전화번호</span>
                      <a href={`tel:${siteSettings.footerPhone}`} className="text-[#002D62] font-bold hover:underline">
                        {siteSettings.footerPhone} (업무용 직통 유선)
                      </a>
                    </div>
                    <div className="flex pt-1">
                      <span className="w-28 text-slate-400 font-bold">주요 공용 업무</span>
                      <span className="text-slate-800 font-medium leading-relaxed">
                        가정 멀티 에어컨 대리점 출고, 시스템 세트 부하 기획, 빌딩형 대용량 멀티 공조 배관설계, 유지 전송 A/S 점검
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW: DIRECTIONS (Contact / How to get here) */}
        {activeTab === 'directions' && (
          <div id="directions_view_container" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-10">
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-black text-[#002D62] tracking-tight">오시는 길</h1>
              <p className="text-slate-500 text-sm font-medium">
                캐리어에어컨 성남총판은 사통팔달 교통 요지인 태평역에 위치하여 서울 및 경기 전역의 신속한 전산 설계 조율이 원활합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Interactive Naver Maps component container */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">경기도 수정구 대표 매장 및 배송본부 상세 지도 (Kakao Maps API)</span>
                  <div className="flex items-center gap-1 text-slate-800 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FEE500] animate-pulse"></div>
                    <span>카카오맵 API 연동 정밀 모드</span>
                  </div>
                </div>

                <KakaoMap />
              </div>

              {/* Transit Text Guide */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h2 className="text-base font-bold text-[#002D62] border-b border-slate-100 pb-2">연락 정보 안내</h2>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#002D62] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">도로명 주소</span>
                        <span className="text-slate-800 font-semibold text-xs leading-relaxed">경기도 성남시 수정구 성남대로 1247, 1층 캐리어에어컨 성남총판</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-[#002D62] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">유선 연락처</span>
                        <a href={`tel:${siteSettings.footerPhone}`} className="text-[#002D62] font-bold text-sm hover:underline block">
                          {siteSettings.footerPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <h2 className="text-base font-bold text-[#002D62] border-b border-slate-100 pb-2">가장 가까운 교통편</h2>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 지하철 이용 시
                      </span>
                      <p className="text-slate-500 leading-relaxed pl-2.5">
                        수인분당선 <strong>태평역 6번 출구</strong> 바로 앞 (출구에서 도보 약 10m 거리에 간판 바로 보임)
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]"></span> 버스 안내
                      </span>
                      <div className="text-slate-500 leading-relaxed pl-2.5 text-xs space-y-2.5">
                        <p>
                          <strong>태평역 정류장 (중앙차로 / 가변차로 정류소)</strong>에서 하차하여 서울/복정역 방면으로 도보 약 1~2분 정도 이동하시면 큰길가(성남대로 1247)의 매장을 찾으실 수 있습니다.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px]">
                          <div className="space-y-2">
                            <span className="font-extrabold text-[#002D62] block mb-1 text-xs">일반 / 간선 / 지선 버스</span>
                            <ul className="space-y-2 text-slate-600 font-medium">
                              <li className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[72px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200/60 text-blue-700 font-bold text-[10px] shrink-0 text-center">[서울간선]</span>
                                <span className="text-slate-700 font-bold font-mono">302, 303, 452</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[72px] px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200/60 text-[#002D62] font-bold text-[10px] shrink-0 text-center">[성남일반]</span>
                                <span className="text-slate-700 font-bold font-mono">2, 50, 57, 100, 220, 330</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[72px] px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold text-[10px] shrink-0 text-center">[서울지선]</span>
                                <span className="text-slate-700 font-bold font-mono">3425</span>
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <span className="font-extrabold text-rose-700 block mb-1 text-xs">광역 및 급행 / 마을 버스</span>
                            <ul className="space-y-2 text-slate-600 font-medium">
                              <li className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[72px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200/60 text-rose-700 font-bold text-[10px] shrink-0 text-center">[직행좌석]</span>
                                <span className="text-slate-700 font-bold font-mono">1009, 1112, 1117, 1650, 500-1, 500-2</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[72px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/60 text-amber-700 font-bold text-[10px] shrink-0 text-center">[마을버스]</span>
                                <span className="text-slate-700 font-bold font-mono">3-1, 73-1, 88, 88-1</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3.5 mt-2 flex gap-2 items-start text-xs text-amber-700 font-bold bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <p className="leading-relaxed text-slate-700">
                        주차 자리가 혼잡하오니 가급적 대중교통을 이용하시기 바랍니다. 캐리어에어컨 성남총판은 큰길가에 위치하고 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div id="admin_tab_root" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">관리자 실시간 온라인 제어실</h1>
                </div>
                <p className="text-slate-500 text-xs font-medium">관리자 전산 토큰이 검수 유지되고 있어, 비밀번호 입력 없이 모든 인입 문의를 즉시 개방 열람하고 소견을 송출 보완할 수 있습니다.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  목록 수동 새로고침
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> 세션 로그아웃
                </button>
              </div>
            </div>

            {/* Submenu Tabs Navigation */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200">
              <button
                onClick={() => setAdminSubTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold rounded-t-xl border-t-2 border-x transition-all duration-150 cursor-pointer ${
                  adminSubTab === 'dashboard'
                    ? 'bg-white border-t-[#002D62] border-x-slate-200 text-[#002D62] shadow-xs'
                    : 'bg-slate-100/50 border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-[#002D62]" /> 대시보드
              </button>
              <button
                onClick={() => setAdminSubTab('settings')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold rounded-t-xl border-t-2 border-x transition-all duration-150 cursor-pointer ${
                  adminSubTab === 'settings'
                    ? 'bg-white border-t-[#002D62] border-x-slate-200 text-[#002D62] shadow-xs'
                    : 'bg-slate-100/50 border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                <Settings className="w-4 h-4 text-[#002D62]" /> 정보수정
              </button>
              <button
                onClick={() => setAdminSubTab('products')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold rounded-t-xl border-t-2 border-x transition-all duration-150 cursor-pointer ${
                  adminSubTab === 'products'
                    ? 'bg-white border-t-[#002D62] border-x-slate-200 text-[#002D62] shadow-xs'
                    : 'bg-slate-100/50 border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                <Plus className="w-4 h-4 text-[#002D62]" /> 제품관리
              </button>
              <button
                onClick={() => setAdminSubTab('account')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold rounded-t-xl border-t-2 border-x transition-all duration-150 cursor-pointer ${
                  adminSubTab === 'account'
                    ? 'bg-white border-t-[#002D62] border-x-slate-200 text-[#002D62] shadow-xs'
                    : 'bg-slate-100/50 border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                <Shield className="w-4 h-4 text-[#002D62]" /> 관리자 계정 관리
              </button>
            </div>

            {/* TAB CONTENTS RENDERER */}
            <div className="space-y-8 pt-2">
              
              {/* SUB TAB: DASHBOARD */}
              {adminSubTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Stats & Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-gradient-to-br from-indigo-900/90 to-[#002D62]/95 text-white p-5 rounded-xl border border-[#0F3F7A]/20 space-y-3 shadow-md text-left">
                      <div className="flex items-center gap-1.5 text-xs text-sky-200 font-bold uppercase tracking-wider">
                        <Globe className="w-4 h-4 text-sky-400" /> 커스텀 도메인 DNS 바인딩 가이드
                      </div>
                      <h3 className="font-bold text-sm">연결 희망 개인 도메인 설정 방안</h3>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        추후 개별 도메인 주소(예: `www.carrier-care.co.kr`) 연결을 도모하실 때는 도메인 구매 대행사(가비아, 후이즈 등) 포털의 DNS 설정 정보에 본 Cloud Run IP 및 호스트 CNAME을 결산 바인딩하시면 즉시 개통 연동됩니다.
                      </p>
                      <div className="bg-black/20 p-2.5 rounded text-[10px] space-y-1 font-mono text-sky-200">
                        <div>• 레코드유형: A 레코드 등록</div>
                        <div>• 호스트값: @ 또는 www 지정</div>
                        <div>• 대상IP주소: {window.location.host} 연결</div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded inline-block uppercase tracking-widest">Inquiry Statistics</span>
                        <h3 className="font-bold text-slate-900 text-sm">총 의뢰 축적 및 접수 현황</h3>
                        <div className="grid grid-cols-3 gap-2 text-center py-1">
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="block text-[10px] text-slate-400 font-bold">인입 합계</span>
                            <span className="text-lg font-black text-[#002D62]">{posts.length}건</span>
                          </div>
                          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                            <span className="block text-[10px] text-amber-500 font-bold">대기/검토</span>
                            <span className="text-lg font-black text-amber-700">{posts.filter(p => p.status !== 'completed').length}건</span>
                          </div>
                          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-xs">
                            <span className="block text-[10px] text-emerald-500 font-bold">완료 비율</span>
                            <span className="text-lg font-black text-emerald-700">
                              {posts.length > 0 ? Math.round((posts.filter(p => p.status === 'completed').length / posts.length) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-2">상담 대기 및 미답변 내역을 보류 없이 해소하는 시공율을 도출하세요.</p>
                    </div>

                    {/* Email notifications summary stats */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between text-left">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block uppercase tracking-widest bg-emerald-50/70 text-emerald-700">ALERT SYSTEM OVERVIEW</span>
                        <h3 className="font-bold text-slate-900 text-sm">관리자 즉시 이메일 발송 로그</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          신임 문의 도착 시, 송신 수임 대행 모드가 발동하여 지연 없이 관리자의 본부 수신처 이메일 연락 통신망으로 접수 소견 전문이 이첩 처리됩니다.
                        </p>
                      </div>
                      <div className="text-[11px] flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                        <span className="text-slate-500 font-medium">배송 수신처:</span>
                        <span className="text-slate-800 font-bold">{siteSettings.footerEmail}</span>
                      </div>
                    </div>

                  </div>

                  {/* Email send detail Logs list */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-4.5 h-4.5 text-[#002D62]" /> 메일 송수신 발송 로그 내역서 ({adminEmailLogs.length}건)
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">SMTP Log System</span>
                    </div>

                    {adminEmailLogs.length === 0 ? (
                      <div className="text-xs text-center text-slate-400 py-6">
                        수립된 이메일 푸시 무선 교신 기록이 전무합니다. 새로운 비회원 인입 문의를 작성하여 테스트 전송을 개시해 보세요!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {adminEmailLogs.map((log) => (
                          <div key={log.id} className="pt-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded text-[9px] font-extrabold ${log.isMock ? 'bg-sky-50 text-sky-700' : 'bg-green-50 text-green-700'}`}>
                                {log.isMock ? '모의시뮬레이션' : 'SMTP 전송'}
                              </span>
                              <span className="font-bold text-slate-800">{log.author} 고객 문의</span>
                              <span className="text-slate-400 truncate max-w-sm">{log.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>전송처: {log.receiver}</span>
                              <span className="font-bold text-emerald-600">{log.status}</span>
                              <span>{new Date(log.timestamp).toLocaleTimeString('ko-KR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inquiries table direct view and controls */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 text-left">
                    <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wide">문의 목록 전수 직결 통제 리스크 조율</h3>
                    
                    <div className="border border-slate-200 rounded-lg overflow-hidden shrink-0">
                      <table className="w-full text-left text-xs text-slate-600 border-collapse">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">문의 명칭</th>
                            <th className="py-3 px-4">성함/상호명</th>
                            <th className="py-3 px-4">연락처 / 회답전망처</th>
                            <th className="py-3 px-4">등록 정보 날짜</th>
                            <th className="py-3 px-4 text-center">동작 및 직결보기</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium font-sans">
                          {posts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400">대기 중인 전산 문서가 없습니다.</td>
                            </tr>
                          ) : (
                            posts.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-4 text-slate-800">{p.title}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-800">{p.author}</td>
                                <td className="py-2.5 px-4 font-bold text-[#002D62]">
                                  {p.contact || '미입력'} / {p.email || '미입력'}
                                </td>
                                <td className="py-2.5 px-4 text-slate-400">
                                  {new Date(p.createdAt).toLocaleDateString('ko-KR')}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    onClick={() => handlePostClick(p)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-[#002D62]/10 text-slate-700 hover:text-[#002D62] rounded font-bold transition-all text-[9.5px] cursor-pointer"
                                  >
                                    비밀번호 없이 즉시개방 및 답변달기
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: INFO / SETTINGS EDIT */}
              {adminSubTab === 'settings' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wide flex items-center gap-1.5">
                        <Settings className="w-4.5 h-4.5 text-sky-600" /> 웹사이트 일반 정보 및 소개 메시지 수정 관리
                      </h3>
                      <p className="text-slate-400 text-[11px]">홈페이지 전반의 헤더, 푸터, 메인 홍보문, 오시는 길 정형 소개 정보를 관리자 권한으로 변경합니다.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-left">
                    {/* 0. Top Header Logo configuration */}
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-sky-600" /> 상단 공식 로고 이미지 설정
                      </h4>
                      
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold mb-1">Carrier 공식 로고 URL 주소</label>
                          <input
                            type="text"
                            value={siteSettings.logoUrl}
                            onChange={(e) => updateSiteSettings({ logoUrl: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                            placeholder="로고 이미지 주소를 입력하거나 아래에서 업로드하세요."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold mb-1">로고 이미지 파일 직접 업로드</label>
                          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 hover:border-[#002D62] hover:bg-[#002D62]/5 rounded-lg p-3 bg-white text-slate-600 hover:text-[#002D62] transition-all cursor-pointer text-center">
                            <Upload className="w-4 h-4 text-sky-600 shrink-0" />
                            <span className="font-bold">로고 파일 선택하기 (PNG, JPG, SVG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result && typeof event.target.result === 'string') {
                                      updateSiteSettings({ logoUrl: event.target.result });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {siteSettings.logoUrl && (
                        <div className="pt-2">
                          <label className="block text-slate-400 text-[10px] mb-1">실시간 헤더 적용 미리보기</label>
                          <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-center border border-slate-200">
                            <img 
                              src={siteSettings.logoUrl} 
                              alt="Header Logo Preview" 
                              className="h-8 object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1. Main Hero block */}
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1.5">메인 배너 홍보 타이틀 & 슬로건</h4>
                      
                      <div className="space-y-1">
                        <label className="block text-slate-500 font-semibold mb-1">홍보 메인 대문구 (\n 입력 시 줄바꿈 적용)</label>
                        <textarea
                          value={siteSettings.heroTitle}
                          onChange={(e) => updateSiteSettings({ heroTitle: e.target.value })}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 font-semibold mb-1">홍보 서브 슬로건 설명문</label>
                        <textarea
                          value={siteSettings.heroSub}
                          onChange={(e) => updateSiteSettings({ heroSub: e.target.value })}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>
                    </div>

                    {/* 2. About section / Company info block */}
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1.5">대표자명 및 정직 기술 철학 소개문</h4>
                      
                      <div className="space-y-1">
                        <label className="block text-slate-500 font-semibold mb-1">상호명 및 대표자 정보</label>
                        <input
                          type="text"
                          value={siteSettings.ceoName}
                          onChange={(e) => updateSiteSettings({ ceoName: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 font-semibold mb-1">사업자등록번호 전체 (구분자 포함)</label>
                        <input
                          type="text"
                          value={siteSettings.businessRegNo}
                          onChange={(e) => updateSiteSettings({ businessRegNo: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 font-semibold mb-1">회사 소개 탭 - 정직한 공조 기술철학 소개 본문 (\n 입력 시 줄바꿈)</label>
                        <textarea
                          value={siteSettings.aboutIntroText}
                          onChange={(e) => updateSiteSettings({ aboutIntroText: e.target.value })}
                          rows={4}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>
                    </div>

                    {/* 3. Footer Block left */}
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                      <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1.5">하단 푸터 정보설정 (Footer & Layout Information)</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold mb-1">본부 주소지 표시 (성남총판)</label>
                          <input
                            type="text"
                            value={siteSettings.footerAddress}
                            onChange={(e) => updateSiteSettings({ footerAddress: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold mb-1">공식 대표 상담 유선 번호</label>
                          <input
                            type="text"
                            value={siteSettings.footerPhone}
                            onChange={(e) => updateSiteSettings({ footerPhone: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold mb-1">수신처 전용 대표 이메일</label>
                          <input
                            type="text"
                            value={siteSettings.footerEmail}
                            onChange={(e) => updateSiteSettings({ footerEmail: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="block text-slate-500 font-semibold mb-1">푸터 우측 법규 및 면책 공고 (이용안내 매칭)</label>
                        <textarea
                          value={siteSettings.footerDisclaimer}
                          onChange={(e) => updateSiteSettings({ footerDisclaimer: e.target.value })}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-[#002D62]"
                        />
                      </div>
                    </div>

                    {/* 4. Menu Visibility Configuration */}
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                      <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                        <EyeOff className="w-4 h-4 text-sky-600" /> 메뉴/탭 노출 제어 관리 (Menu Visibility)
                      </h4>
                      <p className="text-slate-400 text-[11px] mb-2">홈페이지 일반 사용자에게 특정 메뉴의 노출을 임시로 숨기거나 다시 해제할 수 있습니다.</p>
                      
                      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-xs text-left block">제품 소개 (카탈로그) 메뉴 숨기기</span>
                          <p className="text-slate-400 text-[10.5px] text-left block">이 설정을 활성화하면 네비게이션 바 및 홈 화면 하단의 베스트셀러 추천 영역이 온전하게 숨김 처리됩니다.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-4">
                          <input 
                            type="checkbox" 
                            checked={siteSettings.hideProducts === "true"} 
                            onChange={(e) => updateSiteSettings({ hideProducts: e.target.checked ? "true" : "false" })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002D62]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-left">
                      {settingsSaveMessage ? (
                        <span className={`font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border ${settingsSaveMessage.startsWith('❌') ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {settingsSaveMessage}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          * 정보 수정 완료 후 반드시 우측 [사이트 정보 저장 및 클라우드 동기화] 버튼을 클릭하셔야 다른 기기나 외부 접속 환경에서도 변경된 정보가 영구적으로 보존 및 적용됩니다.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={saveSiteSettingsToServer}
                      disabled={isSavingSettings}
                      className="px-5 py-2.5 bg-[#00DDA4] hover:bg-[#00DDA4]/95 disabled:bg-[#00DDA4]/50 text-slate-900 font-extrabold text-xs rounded-lg transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          저장하는 중...
                        </>
                      ) : (
                        <>사이트 정보 저장 및 클라우드 동기화</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB TAB: PRODUCTS MANAGEMENT */}
              {adminSubTab === 'products' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wide flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-sky-600" /> 수정이 수월한 제품 카탈로그 일괄 관리
                    </h3>
                    <button
                      onClick={openAddProductModal}
                      className="px-3.5 py-1.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> 신규 제품 등록
                    </button>
                  </div>

                  {/* EXCEL BULK CONTROLS */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-100 shadow-xs">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> 엑셀 벌크 등록 시스템
                        </span>
                        <h4 className="text-xs font-black text-slate-800">제품 엑셀 양식 다운로드 및 대량 업로드</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          복수의 에어컨 제품 정보를 한 번에 대량 등록하실 수 있습니다. 양식을 다운로드하여 기재하신 후 업로드하세요.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Download template */}
                        <button
                          type="button"
                          onClick={handleDownloadExcelTemplate}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> 엑셀 템플릿 다운로드
                        </button>
                        
                        {/* 2. File Upload selector */}
                        <label className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" /> 엑셀 파일 선택
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleExcelFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Status Feedback Message */}
                    {excelStatusMsg.message && (
                      <div className={`p-3 rounded-lg text-xs font-bold border flex items-start gap-2 ${
                        excelStatusMsg.success 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                          : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        <div className="mt-0.5">ⓘ</div>
                        <div className="flex-1 whitespace-pre-line">{excelStatusMsg.message}</div>
                      </div>
                    )}

                    {/* Parsed Excel Data List Preview Section */}
                    {excelFileRows && excelFileRows.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden space-y-3 p-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#002D62]">엑셀 업로드 행 검토 대기 장치 ({excelFileRows.length}개)</span>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">최종 확인요망</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExcelFileRows(null)}
                              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
                            >
                              가져오기 취소
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmExcelBulkUpload}
                              disabled={excelIsUploading}
                              className="px-4 py-1.5 bg-[#002D62] hover:bg-[#002D62]/90 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer font-sans"
                            >
                              {excelIsUploading ? '서버 전송 중...' : '벌크 업로드 최종 실행'}
                            </button>
                          </div>
                        </div>

                        {/* Visual Table Preview of excel rows */}
                        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                          <table className="w-full text-left text-[11px] text-slate-600 border-collapse">
                            <thead className="bg-slate-50 font-bold border-b border-slate-100">
                              <tr>
                                <th className="py-2 px-3">제품명</th>
                                <th className="py-2 px-3">모델명</th>
                                <th className="py-2 px-3">분류</th>
                                <th className="py-2 px-3">면적 / 에너지등급</th>
                                <th className="py-2 px-3">스펙 정보 (냉방/난방/소비)</th>
                                <th className="py-2 px-3 text-center">인기 설정</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium font-sans">
                              {excelFileRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-1.5 px-3 font-bold text-slate-800 max-w-xs truncate">{row.name}</td>
                                  <td className="py-1.5 px-3 font-mono">{row.model}</td>
                                  <td className="py-1.5 px-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      row.category.includes('system') || row.category.includes('시스템') ? 'bg-sky-50 text-sky-700' :
                                      row.category.includes('commercial') || row.category.includes('상업') ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                                    }`}>
                                      {row.category}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-3 text-slate-500">{row.area || '-'} / {row.efficiency || '-'}</td>
                                  <td className="py-1.5 px-3 font-mono text-slate-500">
                                    {row.cooling || '미기재'} / {row.heating || '없음'} / {row.power || '미기재'}
                                  </td>
                                  <td className="py-1.5 px-3 text-center">
                                    {row.isPopular ? (
                                      <span className="text-rose-600 font-black">★ 추천</span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead className="bg-slate-50 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 w-12 text-center">사진</th>
                          <th className="py-3 px-4">제품명</th>
                          <th className="py-3 px-4">모델명</th>
                          <th className="py-3 px-4">분류</th>
                          <th className="py-3 px-4">면적 / 에너지 등급</th>
                          <th className="py-3 px-4">베스트 인기</th>
                          <th className="py-3 px-4 text-center">동작 관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">등록된 에어컨 제품이 없습니다.</td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-2 px-4 text-center">
                                <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 mx-auto" referrerPolicy="no-referrer" />
                              </td>
                              <td className="py-2 px-4 font-bold text-slate-800">{p.name}</td>
                              <td className="py-2 px-4 font-mono font-semibold text-slate-600">{p.model}</td>
                              <td className="py-2 px-4 font-bold text-sky-700">
                                {p.category === 'residential' ? '가정용' : p.category === 'commercial' ? '상업 대용량' : '시스템/멀티'}
                              </td>
                              <td className="py-2 px-4 text-slate-500">
                                {p.area} / {p.efficiency}
                              </td>
                              <td className="py-2 px-4">
                                {p.isPopular ? (
                                  <span className="inline-block px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[9px] font-bold">인기 기종</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditProductModal(p)}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded font-bold text-[10px] transition-colors cursor-pointer"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[10px] transition-colors cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: ADMIN CREDENTIALS ACCOUNT */}
              {adminSubTab === 'account' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in text-left">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Shield className="w-5 h-5 text-[#002D62]" />
                      <div>
                        <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wide">관리자 전산 통제용 패스코드 변경</h3>
                        <p className="text-slate-400 text-[11px]">관제 화면 접근 및 비인정 회원의 임의 게시글 삭제, 답변 관리를 전면 조율할 때 인증하는 암호를 갱신합니다.</p>
                      </div>
                    </div>

                    <form onSubmit={handleAdminChangePassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold text-xs">신규 관리자 접속 패스코드 설정</label>
                        <input
                          type="password"
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          placeholder="새 비밀번호 입력 (4글자 이상)"
                          className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-[#002D62] font-semibold"
                          required
                        />
                      </div>

                      {adminPasswordStatus.message && (
                        <div className={`p-3 rounded-lg text-xs leading-relaxed font-semibold border ${
                          adminPasswordStatus.success
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {adminPasswordStatus.message}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="py-2.5 px-6 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          암호 통제코드 업데이트
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in text-left">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <MapPin className="w-5 h-5 text-sky-600" />
                      <div>
                        <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wide">외부 서비스 연동 설정 - 카카오맵 API 앱 키</h3>
                        <p className="text-slate-400 text-[11px]">오시는 길 화면에 실시간 동적 카카오맵을 적용하기 위해 발급받은 <strong>JavaScript 앱 키</strong>를 입력합니다. 이 키는 Firestore 데이터베이스에 완전 안전하게 연동 및 보존됩니다.</p>
                      </div>
                    </div>

                    <form onSubmit={handleAdminSaveKakaoKey} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-500 font-bold text-xs">카카오맵 JavaScript 앱 키 입력 (32자리 영문/숫자 복사값)</label>
                        <input
                          type="text"
                          value={adminKakaoKey}
                          onChange={(e) => setAdminKakaoKey(e.target.value)}
                          placeholder="예: 42ad8e398... (무공백 복사값)"
                          className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-[#002D62] font-semibold"
                          required
                        />
                        <span className="block text-slate-400 text-[10.5px]">
                          * 카카오 개발자 콘솔에서 발급받은 'JavaScript 키'를 입력하신 뒤 저장해 주세요. 저장되면 '오시는 길' 페이지에 위치 지도가 실시간으로 출력됩니다.
                        </span>
                      </div>

                      {adminKakaoStatus.message && (
                        <div className={`p-3 rounded-lg text-xs leading-relaxed font-semibold border ${
                          adminKakaoStatus.success
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {adminKakaoStatus.message}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="py-2.5 px-6 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          카카오 API 키 저장하기
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* PRODUCT CREATION/EDITING DIALOG MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-fade-in my-8 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#002D62]" />
                <h3 className="font-black text-[#002D62] text-sm tracking-tight">
                  {editingProduct ? '제품 수정 및 스펙 업데이트' : '신규 캐리어 기종 제품 등록'}
                </h3>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-slate-500 font-bold mb-1">제품 한글명/상세 명칭 *</label>
                <input
                  type="text"
                  placeholder="예: 캐리어 에어로 18단 프리미엄 에어컨"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">모델명 (명찰 모델번호) *</label>
                  <input
                    type="text"
                    placeholder="예: KCD18-S33B"
                    value={prodModel}
                    onChange={(e) => setProdModel(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">제품 카테고리 *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as 'residential' | 'commercial' | 'system')}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-bold"
                  >
                    <option value="residential">가정용 (Residential)</option>
                    <option value="commercial">상업 대용량 (Commercial)</option>
                    <option value="system">천장형 시스템 (System)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">제품 대표 이미지 주소 (URL) *</label>
                <input
                  type="url"
                  placeholder="예: https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">추천 시공 면적 *</label>
                  <input
                    type="text"
                    placeholder="예: 58.5㎡ (18평형)"
                    value={prodArea}
                    onChange={(e) => setProdArea(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">에너지 효율 등급 *</label>
                  <input
                    type="text"
                    placeholder="예: 1등급, 3등급"
                    value={prodEfficiency}
                    onChange={(e) => setProdEfficiency(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">핵심 기능 요약 (쉼표로 구분) *</label>
                <textarea
                  placeholder="예: 초절전 인버터 기술 탑재, 자동 셀프 건조, 고효율 필터"
                  value={prodFeatures}
                  onChange={(e) => setProdFeatures(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 leading-relaxed h-16"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-3">
                <span className="block font-bold text-[#002D62] text-[11px] uppercase tracking-wider">상세 수입 수치 규격 (Specs)</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">정격 냉방 능력</label>
                    <input
                      type="text"
                      placeholder="7.2 kW"
                      value={prodCooling}
                      onChange={(e) => setProdCooling(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-slate-800 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">정격 난방 능력 (선택)</label>
                    <input
                      type="text"
                      placeholder="8.5 kW"
                      value={prodHeating}
                      onChange={(e) => setProdHeating(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-slate-800 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">정격 소비 전력</label>
                    <input
                      type="text"
                      placeholder="2.1 kW"
                      value={prodPower}
                      onChange={(e) => setProdPower(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod_is_popular_check"
                  checked={prodIsPopular}
                  onChange={(e) => setProdIsPopular(e.target.checked)}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded accent-[#002D62]"
                />
                <label htmlFor="prod_is_popular_check" className="font-bold text-slate-700 selection:bg-transparent">
                  베스트셀러 기종 지정 (메인 화면 및 라인업 강조)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold rounded-lg transition-colors"
                >
                  {editingProduct ? '제품 수정 완료' : '새로운 제품 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN DIALOG MODAL ON TOP */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-[#002D62]" />
                <h3 className="font-black text-[#002D62] text-sm tracking-tight">마스터 전산 관리자 인증</h3>
              </div>
              <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="block text-slate-500 font-bold mb-1">관제 접근 패스코드 입력</label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-[#002D62] font-black text-center tracking-widest uppercase text-sm"
                  required
                  autoFocus
                />
              </div>

              {adminLoginError && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> {adminLoginError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold rounded-lg transition-colors"
                >
                  인증 통과
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-1. TERMS OF SERVICE MODAL */}
      {isTermsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[85vh] animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-[#002D62] text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00DDA4]" />
                <h3 className="font-extrabold text-white text-base tracking-tight">홈페이지 이용약관</h3>
              </div>
              <button onClick={() => setIsTermsOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed text-left scrollbar-thin">
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm">제1조 (목적)</h4>
                <p>본 약관은 "캐리어에어컨 성남총판"(이하 "회사" 또는 "총판")이 제공하는 온라인 견적 문의, 매장 안내, 시공 사례 정보 조회 및 관련 제반 서비스(이하 "서비스")를 이용자가 이용함에 있어, 회사와 이용자의 권리·의무, 책임사항 및 이용 프로세스를 규정하는 것을 목적으로 합니다.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제2조 (용어의 정의)</h4>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li><strong>"이용자"</strong>란 본 사이트에 접속하여 본 약관에 따라 서비스를 이용하는 고객(비회원)을 의미합니다.</li>
                  <li><strong>"비회원 간편문의"</strong>란 시공 의뢰, 제품 구매 상담을 위해 기본 성명, 연락처, 개인 비밀번호 등을 입력하고 게시물을 게시하는 행위를 뜻합니다.</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제3조 (약관의 명시와 효력 및 개정)</h4>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>본 약관은 사이트 하단(Footer)에 항상 공개 게시함으로써 효력이 발생합니다.</li>
                  <li>총판은 『약관의 규제에 관한 법률』, 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제4조 (서비스 제공 및 면책 범위)</h4>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>본 사이트는 캐리어 브랜드 에어컨 제품의 특성 규격 소개와 간편 가견적을 산정하는 기술 자문형 무료 홍보 플랫폼입니다.</li>
                  <li>제출되거나 계산하는 견적 자료는 실측 전 참고용 가견적이며, 실제 본시공 및 납품 공급 내역서에 의거하여 정밀 계약이 완성됩니다.</li>
                  <li>천재지변 등 총판에서 기술적으로 제어할 수 없는 망 장애, 서버 중단 등으로 인하여 게시글 저장 유실이 생길 경우 피해에 대한 일체 우발적 책임을 보증하지 아니합니다.</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제5조 (이용자의 의무)</h4>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>이용자는 견적 상담 및 질의 시 타인의 휴대전화번호, 성함을 도용하거나 허위 사실을 기재해서는 안 됩니다.</li>
                  <li>타인의 명예를 훼손하거나 유해성 광고 도배성 게시물을 게시하는 경우 관리자는 고지 없이 글을 삭제 및 영구 차단할 수 있습니다.</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제6조 (분쟁의 해결 및 관할법원)</h4>
                <p>본 약관과 조항의 이용에 관하여 회사와 이용자 간 분쟁이 발생하여 소송이 제기될 경우, 총판의 소재지를 관할하는 법원을 통상의 전담 합의 관할 법원으로 정합니다.</p>
              </section>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end shrink-0 rounded-b-2xl">
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="px-6 py-2 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                동의 후 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-2. PRIVACY POLICY MODAL */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[85vh] animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-[#002D62] text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base tracking-tight">개인정보 처리방침</h3>
              </div>
              <button onClick={() => setIsPrivacyOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-650 leading-relaxed text-left scrollbar-thin animate-fade-in">
              <p className="text-slate-500 font-semibold mb-2">
                "캐리어에어컨 성남총판"은 대한민국 『개인정보 보호법』 및 정보통신망법에 규율된 제반 가이드라인에 근거하여 이용자의 권익과 안전 수집 정보를 보호하기 위해 아래의 개인정보 처리방침을 적극 선언 및 이행하고 있습니다.
              </p>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-950 text-sm">제1조 (개인정보의 수집 및 처리 목적)</h4>
                <p>본 총판은 다음의 명확한 목적을 달성하기 위한 목적성에 한해 이용자의 최소 개인정보를 안전하게 처리합니다:</p>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li><strong>시공 견적 산출 및 도출 중개:</strong> 냉난방 세트 기종 계산, 최적 냉방용량 분석 상담 전화 대응</li>
                  <li><strong>고객 문의 이력 및 상담 데이터베이스 보증:</strong> 시공 계약 수립 완료 시, 하자 유지 보수 기간 내 엔지니어 유선 안내 및 기록 관리</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제2조 (수집하는 개인정보의 항목 및 범위)</h4>
                <p>온라인 간편문의 등록 시 기술 상담 처리를 위해 아래 항목을 최소 필수 취득합니다:</p>
                <ul className="list-disc pl-4.5 space-y-1">
                  <li><strong>필수 수집 정보:</strong> 고객명(작성자 성명), 유선 휴대전화 연락처, 열람 관리 검증용 비밀번호</li>
                  <li><strong>선택 수집 정보:</strong> 이메일 주소, 설계 대상 제품 및 시공 장소 정보</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제3조 (개인정보의 보유 및 파기 절차)</h4>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>본 사이트에서 수집된 비회원 문의는 <strong>상담 및 사후 하자이수 점검완료 시점(최대 1년)</strong>까지 임시 안전 보관하며 보존 시한 소멸 시 지체 없이 복구 불가능한 파일 형태로 파쇄 및 영구 삭제 처리합니다.</li>
                  <li>단, 이용자가 본인의 게시글 삭제 비밀번호를 대조하여 임의 즉시 영구 파기를 원하는 경우, 게시판 상에서 파기 버튼 클릭 시 즉시 완전 멸실 가공됩니다.</li>
                </ol>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제4조 (이용자의 권리와 그 행사방법)</h4>
                <p>이용자는 실시간으로 본인의 개인정보 열람을 요구하거나, 보정 및 즉시 파기를 전담 책임관에게 요구할 수 있으며, 이메일 혹은 대표 유선번호 전화를 통하여 이의 및 파기 집행 청구가 가능합니다.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제5조 (개인정보의 안전성 확보조치)</h4>
                <p>회사는 이용자의 기술 상담 패스워드를 고도의 해시 알고리즘으로 암호화 저장하여 총판 관리자 또한 알 수 없도록 안전하게 격리하며 비인가 열랍을 상시 통제하고 있습니다.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-955 text-sm">제6조 (개인정보 보호 전담 관리자 지정)</h4>
                <p>이용자의 안전을 수립하는 개인정보 민원 및 보호 책임 전문 부서는 다음과 같습니다:</p>
                <ul className="list-disc pl-4.5 space-y-1">
                  <li><strong>전담 부서:</strong> 캐리어에어컨 성남총판 지원관리팀</li>
                  <li><strong>유선 번호:</strong> 010-9125-1049 (또는 홈페이지 유선번호)</li>
                </ul>
              </section>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end shrink-0 rounded-b-2xl">
              <button 
                onClick={() => setIsPrivacyOpen(false)}
                className="px-6 py-2 bg-[#002D62] hover:bg-[#002D62]/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                내용 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer & Information */}
      <footer id="footer_section" className="bg-slate-900 text-slate-400 text-xs py-12 px-4 shadow-inner mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-[#00DDA4]">캐리어에어컨 성남총판</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 max-w-sm">
              캐리어에어컨 성남총판. 서울/경기 전 지사 배송, 전문 엔지니어가 책임 하에 완수하는 정직 공학 시공 전담소.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200">주소 및 연락처</h4>
            <ul className="space-y-2 text-[11.5px]">
              <li>• {siteSettings.footerAddress}</li>
              <li>• 유선번호: <a href={`tel:${siteSettings.footerPhone}`} className="text-white hover:underline font-bold">{siteSettings.footerPhone}</a></li>
              <li>• 이메일: <span className="text-slate-300 font-semibold">{siteSettings.footerEmail}</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200">이용 법규 및 면책 공고</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {siteSettings.footerDisclaimer}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 py-1.5 border-t border-b border-slate-800/60 my-2">
              <button 
                onClick={() => setIsTermsOpen(true)} 
                className="hover:text-sky-400 hover:underline transition-colors cursor-pointer font-semibold"
              >
                이용약관
              </button>
              <span className="text-slate-700">|</span>
              <button 
                onClick={() => setIsPrivacyOpen(true)} 
                className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors cursor-pointer font-bold"
              >
                개인정보 처리방침
              </button>
            </div>
            <p className="text-[10px] text-slate-600 font-mono">
              © {new Date().getFullYear()} Carrier HVAC Expert Solution. All Rights Reserved.
            </p>
            <div className="pt-2 text-[11px]">
              {adminToken ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setActiveTab('admin'); window.scrollTo(0, 0); }} className="text-sky-400 hover:text-sky-300 transition-colors underline font-semibold">관리자 제어판 이동</button>
                  <span className="text-slate-700">|</span>
                  <button onClick={handleAdminLogout} className="text-rose-500 hover:text-rose-400 transition-colors underline">로그아웃</button>
                </div>
              ) : (
                <button onClick={() => { setIsAdminOpen(true); }} className="text-slate-650 hover:text-slate-400 transition-colors underline">💼 관리자 로그인</button>
              )}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
