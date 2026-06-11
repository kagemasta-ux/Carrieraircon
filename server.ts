import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { firestoreService } from './firestoreService.js';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Setup DB folders and JSON files
  const rootDir = process.cwd();
  const dbDir = path.join(rootDir, 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const postsPath = path.join(dbDir, 'posts.json');
  if (!fs.existsSync(postsPath)) {
    fs.writeFileSync(postsPath, '[]');
  }

  const emailsPath = path.join(dbDir, 'emails.json');
  if (!fs.existsSync(emailsPath)) {
    fs.writeFileSync(emailsPath, '[]');
  }

  const productsPath = path.join(dbDir, 'products.json');
  if (!fs.existsSync(productsPath)) {
    const defaultProducts = [
      {
        id: 'aer-18',
        name: '캐리어 에어로 18단 프리미엄 에어컨',
        model: 'KCD18-S33B',
        category: 'residential',
        image: 'https://shopping-phinf.pstatic.net/main_27072973163/27072973163.20210515152345.jpg',
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
        image: 'https://shopping-phinf.pstatic.net/main_26744820525/26744820525.20210411162351.jpg',
        area: '18.7㎡ (6평형)',
        efficiency: '3등급',
        features: ['셀프 클리닝 자동 건조 시스템', '초절전 인버터 기술 탑재', '저소음 수면모드 및 습도조절'],
        specs: { cooling: '2.3 kW', power: '0.65 kW' }
      },
      {
        id: 'sys-34',
        name: '캐리어 벽걸이 에어컨',
        model: 'CSV-A061KL',
        category: 'residential',
        image: 'https://shopping-phinf.pstatic.net/main_26744820525/26744820525.20210411162351.jpg',
        area: '18.7㎡ (6평형)',
        efficiency: '1등급',
        features: ['셀프 클리닝 자동 건조 시스템', '초절전 인버터 기술 탑재', '저소음 수면모드 및 자동 위생 케어'],
        specs: { cooling: '2.3 kW', power: '0.65 kW' },
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
    fs.writeFileSync(productsPath, JSON.stringify(defaultProducts, null, 2));
  }

  // Database helper functions using Firestore with Local Fallback support
  async function readPosts(): Promise<any[]> {
    if (firestoreService.isAvailable()) {
      return await firestoreService.getPosts();
    }
    try {
      const data = fs.readFileSync(postsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async function writePosts(posts: any[]) {
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  }

  async function readEmails(): Promise<any[]> {
    if (firestoreService.isAvailable()) {
      return await firestoreService.getEmails();
    }
    try {
      const data = fs.readFileSync(emailsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async function writeEmails(emails: any[]) {
    fs.writeFileSync(emailsPath, JSON.stringify(emails, null, 2));
  }

  async function readProducts(): Promise<any[]> {
    let products: any[] = [];
    if (firestoreService.isAvailable()) {
      try {
        products = await firestoreService.getProducts();
      } catch (err) {
        console.error('Failed to read products from Firestore:', err);
      }
    }
    
    if (!products || products.length === 0) {
      try {
        const data = fs.readFileSync(productsPath, 'utf-8');
        products = JSON.parse(data);
      } catch {
        products = [];
      }
    }

    // Server-side Migration for stale product data (sys-34 name/image, clar-06 image and aer-18 image)
    let dirty = false;
    const finalProducts: any[] = [];
    for (const p of products) {
      if (p.model === 'KCV-A151MC' || (p.name && p.name.includes('Cassette'))) {
        dirty = true;
        if (firestoreService.isAvailable() && p.id) {
          try {
            console.log(`Deleting stale cassette product ${p.id} from Firestore...`);
            await firestoreService.deleteProduct(p.id);
          } catch (e) {
            console.error('Failed to delete stale cassette product:', e);
          }
        }
        continue; // skip sending or keeping this stale product
      }

      let updatedProd = { ...p };

      // Migrate sys-34 details
      if (p.id === 'sys-34') {
        const targetName = '캐리어 벽걸이 에어컨';
        const targetModel = 'CSV-A061KL';
        const targetCategory = 'residential';
        const targetImg = 'https://shopping-phinf.pstatic.net/main_26744820525/26744820525.20210411162351.jpg';
        const targetArea = '18.7㎡ (6평형)';
        if (p.name !== targetName || p.model !== targetModel || p.category !== targetCategory || p.image !== targetImg || p.area !== targetArea) {
          dirty = true;
          updatedProd = {
            ...p,
            name: targetName,
            model: targetModel,
            category: targetCategory,
            image: targetImg,
            area: targetArea,
            efficiency: '1등급',
            features: [
              '셀프 클리닝 자동 건조 시스템',
              '초절전 인버터 기술 탑재',
              '저소음 수면모드 및 자동 위생 케어'
            ],
            specs: { cooling: '2.3 kW', power: '0.65 kW' },
            isPopular: true
          };
        }
      } else if (p.id === 'clar-06') {
        const targetImg = 'https://shopping-phinf.pstatic.net/main_26744820525/26744820525.20210411162351.jpg';
        if (p.image !== targetImg) {
          dirty = true;
          updatedProd = {
            ...p,
            image: targetImg
          };
        }
      } else if (p.id === 'aer-18') {
        const targetImg = 'https://shopping-phinf.pstatic.net/main_27072973163/27072973163.20210515152345.jpg';
        if (p.image !== targetImg) {
          dirty = true;
          updatedProd = {
            ...p,
            image: targetImg
          };
        }
      }

      // General fallback check for old Unsplash images
      const staleAer18Img = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400';
      const staleWallImg = 'https://images.unsplash.com/photo-1585338111222-d48d7169f96f?auto=format&fit=crop&q=80&w=400';
      if (updatedProd.image === staleAer18Img) {
        dirty = true;
        updatedProd.image = 'https://shopping-phinf.pstatic.net/main_27072973163/27072973163.20210515152345.jpg';
      } else if (updatedProd.image === staleWallImg) {
        dirty = true;
        updatedProd.image = 'https://shopping-phinf.pstatic.net/main_26744820525/26744820525.20210411162351.jpg';
      }

      finalProducts.push(updatedProd);
    }

    if (dirty) {
      console.log('Migrating stale products inside Firestore or local file...');
      if (firestoreService.isAvailable()) {
        for (const p of finalProducts) {
          const { id, ...payload } = p;
          try {
            await firestoreService.saveProduct(id, payload);
          } catch (err) {
            console.error(`Failed to save migrated product ${id}:`, err);
          }
        }
      }
      try {
        fs.writeFileSync(productsPath, JSON.stringify(finalProducts, null, 2));
      } catch (e) {
        console.error('Failed to write migrated products to local file:', e);
      }
      products = finalProducts;
    }

    return products;
  }

  async function writeProducts(products: any[]) {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  }

  // Site Settings Initialization and Helpers
  const siteSettingsPath = path.join(dbDir, 'site_settings.json');
  const defaultSiteSettings = {
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Carrier_logo.svg/320px-Carrier_logo.svg.png",
    ceoName: "캐리어에어컨 성남총판 / 안영원 대표",
    aboutIntroText: "인류 최초 에어컨 발명자 윌리스 캐리어의 후속 120년 정통 공조 기술 명망을 닻삼아, 한 치 거짓 없는 규격 동자재와 최선 선진 연산 치수로 완벽 시공을 사명으로 실천하는 정직한 캐리어에어컨 성남총판입니다.",
    footerAddress: "경기도 성남시 수정구 성남대로 1247, 1층 캐리어에어컨 성남총판",
    footerPhone: "1588-6883",
    footerEmail: "01carrier@hanmail.net",
    footerDisclaimer: "본 홈페이지는 캐리어에어컨 기기 납품 및 시공 설계 견적 성함을 인계받아 책임 이첩하는 비회원 안심 전산망입니다. 수집된 최소 작성번호는 4자리 본인 매칭 이외의 목적으로 제3자 제공이나 누출이 일체 봉쇄됩니다.",
    heroTitle: "120년 냉동공조 기술력, \n캐리어에어컨 성남총판",
    heroSub: "법인 및 상업 시설 완벽 특화 최적 설계! 에너지효율은 극한으로 올리고 오차 없는 밀착 시공을 도모합니다.",
    businessRegNo: "120-81-01185",
    hideProducts: "true"
  };

  if (!fs.existsSync(siteSettingsPath)) {
    fs.writeFileSync(siteSettingsPath, JSON.stringify(defaultSiteSettings, null, 2));
  }

  async function readSiteSettings(): Promise<any> {
    let localSettings = defaultSiteSettings;
    try {
      if (fs.existsSync(siteSettingsPath)) {
        const data = fs.readFileSync(siteSettingsPath, 'utf-8');
        localSettings = { ...defaultSiteSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading local site_settings.json:', e);
    }

    let settings = localSettings;
    if (firestoreService.isAvailable()) {
      try {
        settings = await firestoreService.getSiteSettings(localSettings);
      } catch (err) {
        console.error('Failed to read siteSettings from Firestore:', err);
      }
    }

    // Server-side Migration for Stale Cloud/Local Site Settings
    let migrated = false;
    const s = { ...settings };

    if (!s.ceoName || s.ceoName.includes('이기영') || s.ceoName.includes('시공 케어 파트너')) {
      s.ceoName = defaultSiteSettings.ceoName;
      migrated = true;
    }
    if (!s.aboutIntroText || s.aboutIntroText.includes('공식 파트너입니다') || s.aboutIntroText.includes('정식 공식 파트너')) {
      s.aboutIntroText = defaultSiteSettings.aboutIntroText;
      migrated = true;
    }
    if (!s.footerPhone || s.footerPhone === '1588-1234') {
      s.footerPhone = defaultSiteSettings.footerPhone;
      migrated = true;
    }
    if (!s.footerEmail || s.footerEmail === 'kagemasta@gmail.com') {
      s.footerEmail = defaultSiteSettings.footerEmail;
      migrated = true;
    }
    if (!s.heroTitle || s.heroTitle.includes('캐리어에어컨 파트너') || s.heroTitle.includes('공식 파트너')) {
      s.heroTitle = defaultSiteSettings.heroTitle;
      migrated = true;
    }
    if (!s.heroSub || s.heroSub.includes('개인사업자')) {
      s.heroSub = defaultSiteSettings.heroSub;
      migrated = true;
    }
    if (!s.businessRegNo || s.businessRegNo.includes('XXXXX') || s.businessRegNo === '120-81-XXXXX') {
      s.businessRegNo = defaultSiteSettings.businessRegNo;
      migrated = true;
    }

    if (migrated) {
      console.log('Migrating site settings to updated values on the server and syncing with database...');
      await writeSiteSettings(s);
      settings = s;
    } else {
      // Force sync back to local settings if firestore had local difference but no migration was needed
      try {
        if (fs.existsSync(siteSettingsPath)) {
          const fileData = fs.readFileSync(siteSettingsPath, 'utf-8');
          if (JSON.stringify(settings) !== fileData) {
            fs.writeFileSync(siteSettingsPath, JSON.stringify(settings, null, 2));
          }
        } else {
          fs.writeFileSync(siteSettingsPath, JSON.stringify(settings, null, 2));
        }
      } catch (e) {
        // ignore
      }
    }

    return settings;
  }

  async function writeSiteSettings(settings: any) {
    if (firestoreService.isAvailable()) {
      try {
        await firestoreService.setSiteSettings(settings);
      } catch (err) {
        console.error('Failed to write siteSettings to Firestore:', err);
      }
    }
    try {
      fs.writeFileSync(siteSettingsPath, JSON.stringify(settings, null, 2));
    } catch (e) {
      console.error('Error writing local site_settings.json:', e);
    }
  }

  // Admin Credentials (Persistent in admin.json and Firestore)
  const adminCredsPath = path.join(dbDir, 'admin.json');
  if (!fs.existsSync(adminCredsPath)) {
    fs.writeFileSync(adminCredsPath, JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'carrier1234' }, null, 2));
  }

  async function getAdminPassword(): Promise<string> {
    let localPassword = 'carrier1234';
    try {
      if (fs.existsSync(adminCredsPath)) {
        const data = fs.readFileSync(adminCredsPath, 'utf-8');
        const json = JSON.parse(data);
        localPassword = json.password || 'carrier1234';
      }
    } catch (e) {
      console.error('Error reading local admin.json:', e);
    }

    if (firestoreService.isAvailable()) {
      try {
        const firestorePassword = await firestoreService.getAdminPassword(process.env.ADMIN_PASSWORD || localPassword);
        if (firestorePassword !== localPassword) {
          console.log(`[Admin Password Sync] Synchronizing Firestore admin password to match local admin.json password: ${localPassword}`);
          await firestoreService.setAdminPassword(localPassword);
        }
      } catch (err) {
        console.error('[Admin Password Sync] Failed to sync with Firestore:', err);
      }
    }
    return localPassword;
  }

  async function setAdminPassword(password: string) {
    if (firestoreService.isAvailable()) {
      await firestoreService.setAdminPassword(password);
    }
    fs.writeFileSync(adminCredsPath, JSON.stringify({ password }, null, 2));
  }

  // Auto-Seeding Trigger on Startup
  if (firestoreService.isAvailable()) {
    try {
      const localPosts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const localEmails = JSON.parse(fs.readFileSync(emailsPath, 'utf-8'));
      const localProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const localAdminPassword = fs.existsSync(adminCredsPath)
        ? JSON.parse(fs.readFileSync(adminCredsPath, 'utf-8')).password
        : (process.env.ADMIN_PASSWORD || 'carrier1234');

      firestoreService.seedData({
        posts: localPosts,
        products: localProducts,
        emails: localEmails,
        adminPassword: localAdminPassword
      }).then(() => {
        console.log('🎉 Firestore automatic database seeding Completed successfully!');
      }).catch(err => {
        console.error('❌ Failed seeding Firestore collections:', err);
      });
    } catch (e) {
      console.warn('Could not read local data for seeding:', e);
    }
  }

  const ADMIN_TOKEN = 'token_carrier_admin_987654321_secret';

  // Helper to check admin status
  const getAdminStatus = (req: express.Request): boolean => {
    const token = req.headers['x-admin-token'] || req.headers['authorization']?.toString().replace('Bearer ', '');
    return token === ADMIN_TOKEN;
  };

  // Helper middleware wrapper to prevent unhandled promise rejections and clean JSON error output
  const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      fn(req, res, next).catch((err) => {
        console.error("Express API Error:", req.method, req.path, err);
        res.status(500).json({
          success: false,
          message: '데이터 처리 중 오류가 발생했습니다.',
          error: err instanceof Error ? err.message : String(err)
        });
      });
    };
  };

  // 0. GET /api/config/kakao - Return dynamic Kakao Map App Key for runtime client loading
  app.get('/api/config/kakao', asyncHandler(async (req, res) => {
    let key = process.env.VITE_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY || '';
    
    // Check local admin.json as backup if env not set
    if (!key) {
      try {
        if (fs.existsSync(adminCredsPath)) {
          const localAdmin = JSON.parse(fs.readFileSync(adminCredsPath, 'utf-8'));
          key = localAdmin.kakaoAppKey || '';
        }
      } catch (e) {
        console.warn('Could not read kakaoAppKey from local admin.json:', e);
      }
    }

    // Check Firestore admin/settings as best durable fallback
    if (!key && firestoreService.isAvailable()) {
      try {
        key = await firestoreService.getKakaoAppKey(key);
      } catch (err) {
        console.warn('Could not read kakaoAppKey from Firestore:', err);
      }
    }

    res.json({ success: true, appKey: key });
  }));

  // 1. GET /api/posts - Get list of board posts (scrubbed contact/content/email for general public)
  app.get('/api/posts', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    const posts = await readPosts();

    const sanitizedPosts = posts.map(p => {
      // If admin, return full post. If not, hide sensitive fields
      if (isAdmin) {
        return { ...p, isSecret: false };
      }
      return {
        id: p.id,
        category: p.category,
        title: p.title,
        author: p.author,
        status: p.status,
        createdAt: p.createdAt,
        product: p.product,
        replyCount: p.replies ? p.replies.length : 0,
        isSecret: true // needs password verification to view description and attachments
      };
    });

    res.json({ success: true, posts: sanitizedPosts });
  }));

  // 2. POST /api/posts - Create inquiry / quote request
  app.post('/api/posts', asyncHandler(async (req, res) => {
    const { category, title, author, content, contact, email, product, password } = req.body;

    if (!title || !author || !content || !password) {
      return res.status(400).json({ success: false, message: '필수 입력 항목(제목, 작성자, 내용, 비밀번호)이 누락되었습니다.' });
    }

    const newPost = {
      id: `post_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      category: category || 'quote',
      title,
      author,
      content,
      contact: contact || '',
      email: email || '',
      product: product || '',
      password, // plaintext stored for basic user verification comparison
      status: 'pending', // pending, reviewing, completed
      createdAt: new Date().toISOString(),
      replies: []
    };

    if (firestoreService.isAvailable()) {
      await firestoreService.savePost(newPost.id, newPost);
    }
    const posts = await readPosts();
    if (!firestoreService.isAvailable()) {
      posts.unshift(newPost);
    }
    await writePosts(posts);

    // E-mail trigger setup
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const notificationReceiver = process.env.NOTIFICATION_RECEIVER || '01carrier@hanmail.net';

    let emailLogStatus = '';
    let isMock = true;

    const emailSubject = `[캐리어에어컨 ${category === 'quote' ? '견적요청' : '일반문의'}] 새로운 문의가 접수되었습니다.`;
    const emailBodyText = `
캐리어에어컨 성남총판 홈페이지에 새로운 문의가 등록되었습니다.

■ 분류: ${category === 'quote' ? '견적 요청' : '일반 문의'}
■ 작성자: ${author}
■ 연락처: ${contact || '없음'}
■ 이메일: ${email || '없음'}
■ 관심 상품: ${product || '선택 안 함'}

■ 제목: ${title}
■ 내용:
${content}

--------------------------------------------------
관리자 페이지에 개발자용 액세스로 로그인하면 답변을 등록할 수 있습니다.
    `;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Carrier AC Website" <${smtpUser}>`,
          to: notificationReceiver,
          subject: emailSubject,
          text: emailBodyText,
        });

        emailLogStatus = `성공 (발송인: ${smtpUser} -> 수신인: ${notificationReceiver})`;
        isMock = false;
      } catch (err: any) {
        emailLogStatus = `SMTP 발송 실패 (${err.message})`;
        isMock = false;
      }
    } else {
      emailLogStatus = `모의 발송 (이메일 설정 미완료, 발송 내역 시뮬레이션). 수신처: ${notificationReceiver}`;
      isMock = true;
      console.log(`\n=== [SMTP ALARM CONSOLE LOG] ===\nSubject: ${emailSubject}\nTo: ${notificationReceiver}\nBody:\n${emailBodyText}\n=== [SMTP ALARM END] ===\n`);
    }

    // Write to email log database
    const newEmail = {
      id: `email_${Date.now()}`,
      category,
      title,
      author,
      receiver: notificationReceiver,
      status: emailLogStatus,
      isMock,
      timestamp: new Date().toISOString()
    };

    if (firestoreService.isAvailable()) {
      await firestoreService.saveEmail(newEmail.id, newEmail);
    }
    const emails = await readEmails();
    if (!firestoreService.isAvailable()) {
      emails.unshift(newEmail);
    }
    await writeEmails(emails);

    res.json({ success: true, post: newPost, emailStatus: emailLogStatus, isMock });
  }));

  // 3. POST /api/posts/:id/verify - Verify post password and return full details
  app.post('/api/posts/:id/verify', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const isAdmin = getAdminStatus(req);

    let post = null;
    if (firestoreService.isAvailable()) {
      post = await firestoreService.getPostById(id);
    } else {
      const posts = await readPosts();
      post = posts.find(p => p.id === id);
    }

    if (!post) {
      return res.status(404).json({ success: false, message: '글을 찾을 수 없습니다.' });
    }

    if (isAdmin || post.password === password) {
      const { password, ...postWithoutPassword } = post;
      return res.json({ success: true, post: postWithoutPassword });
    }

    return res.status(403).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  }));

  // 4. POST /api/admin/login - Authenticate Admin
  app.post('/api/admin/login', asyncHandler(async (req, res) => {
    const { password } = req.body;
    const adminPassword = await getAdminPassword();
    if (password === adminPassword) {
      return res.json({ success: true, token: ADMIN_TOKEN });
    }
    return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  }));

  // 4.1 POST /api/admin/change-password - Change Admin Password (Admin only)
  app.post('/api/admin/change-password', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
    const { password } = req.body;
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ success: false, message: '비밀번호는 최소 4글자 이상이어야 합니다.' });
    }
    await setAdminPassword(password.trim());
    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  }));

  // 4.2 GET /api/admin/config/kakao - Get Kakao Map App Key (Admin only)
  app.get('/api/admin/config/kakao', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
    
    let key = process.env.VITE_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY || '';
    if (fs.existsSync(adminCredsPath)) {
      try {
        const localAdmin = JSON.parse(fs.readFileSync(adminCredsPath, 'utf-8'));
        key = localAdmin.kakaoAppKey || key;
      } catch (e) {}
    }
    if (firestoreService.isAvailable()) {
      try {
        key = await firestoreService.getKakaoAppKey(key);
      } catch (err) {}
    }
    res.json({ success: true, appKey: key });
  }));

  // 4.3 POST /api/admin/config/kakao - Update Kakao Map App Key (Admin only)
  app.post('/api/admin/config/kakao', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
    const { appKey } = req.body;
    
    // Save to Firestore settings
    if (firestoreService.isAvailable()) {
      try {
        await firestoreService.setKakaoAppKey(appKey || '');
      } catch (err) {
        console.error('Failed to write kakaoAppKey to Firestore:', err);
      }
    }

    // Save to local admin.json config backup
    try {
      let localData: any = {};
      if (fs.existsSync(adminCredsPath)) {
        localData = JSON.parse(fs.readFileSync(adminCredsPath, 'utf-8'));
      }
      fs.writeFileSync(adminCredsPath, JSON.stringify({ ...localData, kakaoAppKey: appKey || '' }, null, 2));
    } catch (e) {
      console.error('Failed to save to local admin.json config:', e);
    }

    res.json({ success: true, message: '카카오맵 API 앱 키가 성공적으로 업데이트되었습니다.' });
  }));

  // 4.4 GET /api/site-settings - Return current dynamic site settings (Logo, text, numbers etc.)
  app.get('/api/site-settings', asyncHandler(async (req, res) => {
    const settings = await readSiteSettings();
    res.json({ success: true, settings });
  }));

  // 4.5 POST /api/site-settings - Update dynamic site settings (Admin only)
  app.post('/api/site-settings', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ success: false, message: '올바른 설정 값이 아닙니다.' });
    }
    await writeSiteSettings(newSettings);
    res.json({ success: true, message: '사이트 전역 설정 정보가 수정 및 클라우드 연동되었습니다.' });
  }));

  // 5. GET /api/admin/check - Verify Admin session
  app.get('/api/admin/check', (req, res) => {
    const isAdmin = getAdminStatus(req);
    return res.json({ success: isAdmin });
  });

  // 6. POST /api/posts/:id/reply - Admin post reply or change post status
  app.post('/api/posts/:id/reply', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, status } = req.body;
    const isAdmin = getAdminStatus(req);

    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    let post = null;
    if (firestoreService.isAvailable()) {
      post = await firestoreService.getPostById(id);
    } else {
      const posts = await readPosts();
      post = posts.find(p => p.id === id);
    }

    if (!post) {
      return res.status(404).json({ success: false, message: '글을 찾을 수 없습니다.' });
    }

    if (content) {
      const newReply = {
        id: `reply_${Date.now()}`,
        author: '관리자',
        content,
        createdAt: new Date().toISOString()
      };
      if (!post.replies) {
        post.replies = [];
      }
      post.replies.push(newReply);
    }

    if (status) {
      post.status = status;
    } else if (content) {
      post.status = 'completed'; // auto-complete if replied
    }

    if (firestoreService.isAvailable()) {
      await firestoreService.savePost(id, post);
    }
    const posts = await readPosts();
    if (!firestoreService.isAvailable()) {
      const postIdx = posts.findIndex(p => p.id === id);
      if (postIdx !== -1) {
        posts[postIdx] = post;
      }
    }
    await writePosts(posts);
    res.json({ success: true, post });
  }));

  // 7. DELETE /api/posts/:id - Delete post (authorized by admin or correct password)
  app.delete('/api/posts/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const isAdmin = getAdminStatus(req);

    let post = null;
    if (firestoreService.isAvailable()) {
      post = await firestoreService.getPostById(id);
    } else {
      const posts = await readPosts();
      post = posts.find(p => p.id === id);
    }

    if (!post) {
      return res.status(404).json({ success: false, message: '글을 찾을 수 없습니다.' });
    }

    if (isAdmin || post.password === password) {
      if (firestoreService.isAvailable()) {
        await firestoreService.deletePost(id);
      }
      const posts = await readPosts();
      const filtered = posts.filter(p => p.id !== id);
      await writePosts(filtered);
      return res.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.' });
    }

    return res.status(403).json({ success: false, message: '비밀번호가 일치하지 않아 삭제할 수 없습니다.' });
  }));

  // 8. GET /api/admin/emails - Retrieve logs of sent emails
  app.get('/api/admin/emails', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }
    const emails = await readEmails();
    res.json({ success: true, emails });
  }));

  // 9. GET /api/products - Get all products from data/products.json
  app.get('/api/products', asyncHandler(async (req, res) => {
    const products = await readProducts();
    res.json({ success: true, products });
  }));

  // 10. POST /api/products - Create a new product (admin only)
  app.post('/api/products', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    const { name, model, category, image, area, efficiency, features, specs, isPopular } = req.body;
    if (!name || !model || !category || !image || !area || !efficiency) {
      return res.status(400).json({ success: false, message: '필수 항목이 누락되었습니다.' });
    }

    const newProduct = {
      id: `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      model,
      category,
      image,
      area,
      efficiency,
      features: Array.isArray(features) ? features : (features ? features.toString().split(',').map((f: string) => f.trim()) : []),
      specs: specs || { cooling: '미기재', power: '미기재' },
      isPopular: !!isPopular
    };

    if (firestoreService.isAvailable()) {
      await firestoreService.saveProduct(newProduct.id, newProduct);
    }
    const products = await readProducts();
    if (!firestoreService.isAvailable()) {
      products.push(newProduct);
    }
    await writeProducts(products);
    res.json({ success: true, product: newProduct });
  }));

  // 11. PUT /api/products/:id - Update an existing product (admin only)
  app.put('/api/products/:id', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    const { id } = req.params;
    const { name, model, category, image, area, efficiency, features, specs, isPopular } = req.body;

    let products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
    }

    const updated = {
      ...products[index],
      name: name !== undefined ? name : products[index].name,
      model: model !== undefined ? model : products[index].model,
      category: category !== undefined ? category : products[index].category,
      image: image !== undefined ? image : products[index].image,
      area: area !== undefined ? area : products[index].area,
      efficiency: efficiency !== undefined ? efficiency : products[index].efficiency,
      features: features !== undefined ? (Array.isArray(features) ? features : features.toString().split(',').map((f: string) => f.trim())) : products[index].features,
      specs: specs !== undefined ? specs : products[index].specs,
      isPopular: isPopular !== undefined ? !!isPopular : products[index].isPopular
    };

    if (firestoreService.isAvailable()) {
      await firestoreService.saveProduct(id, updated);
    }
    products = await readProducts();
    if (!firestoreService.isAvailable()) {
      products[index] = updated;
    }
    await writeProducts(products);
    res.json({ success: true, product: updated });
  }));

  // 12. DELETE /api/products/:id - Delete an existing product (admin only)
  app.delete('/api/products/:id', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    const { id } = req.params;
    const products = await readProducts();
    const exists = products.some(p => p.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
    }

    if (firestoreService.isAvailable()) {
      await firestoreService.deleteProduct(id);
    }
    const filtered = products.filter(p => p.id !== id);
    await writeProducts(filtered);
    res.json({ success: true, message: '제품이 성공적으로 삭제되었습니다.' });
  }));

  // 12.1 POST /api/products/bulk - Bulk create multiple products (admin only)
  app.post('/api/products/bulk', asyncHandler(async (req, res) => {
    const isAdmin = getAdminStatus(req);
    if (!isAdmin) {
      return res.status(401).json({ success: false, message: '관리자 권한이 필요합니다.' });
    }

    const { products: bulkProducts } = req.body;
    if (!Array.isArray(bulkProducts)) {
      return res.status(400).json({ success: false, message: '올바르지 않은 데이터 형식입니다.' });
    }

    const currentProducts = await readProducts();
    const processed = bulkProducts.map((p, index) => {
      // Map categories neatly
      let categoryMapped: 'residential' | 'commercial' | 'system' = 'residential';
      const catStr = String(p.category || '').trim();
      if (catStr.includes('commercial') || catStr.includes('상업') || catStr.includes('대용량') || catStr.includes('매장')) {
        categoryMapped = 'commercial';
      } else if (catStr.includes('system') || catStr.includes('시스템') || catStr.includes('멀티') || catStr.includes('천장')) {
        categoryMapped = 'system';
      }

      // Parse features
      let featuresList: string[] = [];
      if (Array.isArray(p.features)) {
        featuresList = p.features.map(String);
      } else if (p.features) {
        featuresList = String(p.features).split(',').map((f: string) => f.trim()).filter(Boolean);
      }

      return {
        id: `p_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
        name: String(p.name || p['제품명'] || '').trim(),
        model: String(p.model || p['모델명'] || '').trim(),
        category: categoryMapped,
        image: String(p.image || p['이미지URL'] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400').trim(),
        area: String(p.area || p['설치면적'] || p['면적'] || '').trim(),
        efficiency: String(p.efficiency || p['에너지등급'] || p['등급'] || '일반등급').trim(),
        features: featuresList,
        specs: {
          cooling: String(p.specs?.cooling || p.cooling || p['냉방능력'] || '미기재').trim(),
          heating: String(p.specs?.heating || p.heating || p['난방능력'] || '').trim(),
          power: String(p.specs?.power || p.power || p['소비전력'] || '미기재').trim(),
        },
        isPopular: p.isPopular === true || p.isPopular === 'true' || String(p['인기기종'] || p['베스트'] || '').trim() === 'O' || String(p['인기기종'] || p['베스트'] || '').trim() === 'Y'
      };
    });

    const validProducts = processed.filter(p => p.name && p.model);
    if (validProducts.length === 0) {
      return res.status(400).json({ success: false, message: '유효한 제품 데이터(제품명, 모델명 필수)가 누락되었습니다.' });
    }

    if (firestoreService.isAvailable()) {
      for (const p of validProducts) {
        await firestoreService.saveProduct(p.id, p);
      }
    }
    const updatedList = [...currentProducts, ...validProducts];
    await writeProducts(updatedList);
    res.json({ success: true, count: validProducts.length, products: validProducts });
  }));

  // Handle SPA and static assets
  if (isProd) {
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (req, res) => {
      // Exclude API paths
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API Route Not Found' });
      }
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  } else {
    // Vite Middlewares in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carrier AC Business Website server listening on port ${PORT}`);
    console.log(`Environment: ${isProd ? 'Production' : 'Development'}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
});
