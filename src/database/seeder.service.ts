import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { BannersService } from '../banners/banners.service';
import { TopicsService } from '../topics/topics.service';
import { USPsService } from '../usps/usps.service';
import { ProgramsService } from '../programs/programs.service';
import { ProgramCategory } from '../programs/entities/program.entity';
import { EventsService } from '../events/events.service';
import { EventCategory } from '../events/entities/event.entity';
import { VideoCoursesService } from '../video-courses/video-courses.service';
import { CommunitiesService } from '../communities/communities.service';
import { FAQsService } from '../faqs/faqs.service';
import { PagesService } from '../pages/pages.service';
import { FooterService } from '../footer/footer.service';
import { UploadService } from '../upload/upload.service';

const BUCKET_BASE = 'https://storage.alliago.id/jaribakat-new';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly bannersService: BannersService,
    private readonly topicsService: TopicsService,
    private readonly uspsService: USPsService,
    private readonly programsService: ProgramsService,
    private readonly eventsService: EventsService,
    private readonly videoCoursesService: VideoCoursesService,
    private readonly communitiesService: CommunitiesService,
    private readonly faqsService: FAQsService,
    private readonly pagesService: PagesService,
    private readonly footerService: FooterService,
    private readonly uploadService: UploadService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Executing complete database seeder with direct MinIO storage bucket uploads...');
    await this.syncFavicons();
    await this.seedUser();
    await this.seedSiteSettings();
    await this.seedBanners();
    await this.seedTopics();
    await this.seedUSPs();
    await this.seedPrograms();
    await this.seedEvents();
    await this.seedVideoCourses();
    await this.seedCommunities();
    await this.seedFAQs();
    await this.seedPages();
    await this.seedFooter();
    await this.cleanAndUploadAllAssetsToMinIO();
    this.logger.log('Database seeding & MinIO uploads finished successfully!');
  }

  private async syncFavicons() {
    try {
      const primaryMascot = path.join(process.cwd(), '../dashboard/public/image.png');
      const fallbackLogo = path.join(process.cwd(), '../jaribakat/public/images/jaribakat.png');
      const srcLogo = fs.existsSync(primaryMascot) ? primaryMascot : fallbackLogo;

      if (fs.existsSync(srcLogo)) {
        const buffer = fs.readFileSync(srcLogo);
        const targets = [
          path.join(process.cwd(), '../jaribakat/src/app/favicon.ico'),
          path.join(process.cwd(), '../jaribakat/src/app/icon.png'),
          path.join(process.cwd(), '../jaribakat/public/favicon.ico'),
          path.join(process.cwd(), '../jaribakat/public/image.png'),
          path.join(process.cwd(), '../jaribakat/public/images/jaribakat.png'),
          path.join(process.cwd(), '../dashboard/src/app/favicon.ico'),
          path.join(process.cwd(), '../dashboard/public/favicon.ico'),
          path.join(process.cwd(), '../dashboard/public/image.png'),
        ];
        for (const target of targets) {
          const dir = path.dirname(target);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(target, buffer);
          this.logger.log(`Synced JariBakat mascot image to ${target}`);
        }
      }
    } catch (err) {
      this.logger.warn('Notice syncing favicons:', err?.message || err);
    }
  }

  private async uploadLocalAssetToMinIO(fileName: string, folder = 'seed'): Promise<string> {
    try {
      const possiblePaths = [
        path.join(process.cwd(), '../jaribakat/public/images', fileName),
        path.join(process.cwd(), 'public/images', fileName),
        path.join(__dirname, '../../../../jaribakat/public/images', fileName),
      ];

      let foundPath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      if (foundPath) {
        const buffer = fs.readFileSync(foundPath);
        const ext = fileName.split('.').pop()?.toLowerCase() || 'png';
        const mimetype = ext === 'png' ? 'image/png' : 'image/jpeg';
        const url = await this.uploadService.uploadBuffer(buffer, fileName, mimetype, folder);
        this.logger.log(`Uploaded seed asset to MinIO storage bucket: ${fileName} -> ${url}`);
        return url;
      }
    } catch (err) {
      this.logger.warn(`Notice uploading local asset ${fileName} to MinIO:`, err?.message || err);
    }

    // Fallback MinIO storage bucket URL
    return `${BUCKET_BASE}/${folder}/${fileName}`;
  }

  private async cleanAndUploadAllAssetsToMinIO() {
    this.logger.log('Uploading all seed images to MinIO bucket and updating database records...');

    // Upload core image assets to MinIO
    const banner1Url = await this.uploadLocalAssetToMinIO('banner-jaribakat.png', 'banners');
    const banner1MobUrl = await this.uploadLocalAssetToMinIO('WhatsApp Image 2026-07-25 at 5.04.01 PM(1).jpeg', 'banners');
    const banner2Url = await this.uploadLocalAssetToMinIO('banner-landscape2.jpeg', 'banners');
    const banner2MobUrl = await this.uploadLocalAssetToMinIO('WhatsApp Image 2026-07-25 at 5.24.43 PM.jpeg', 'banners');
    const banner3Url = await this.uploadLocalAssetToMinIO('banner-landscape3.jpeg', 'banners');
    const banner3MobUrl = await this.uploadLocalAssetToMinIO('WhatsApp Image 2026-07-25 at 5.12.44 PM.jpeg', 'banners');

    const topicIconUrl = await this.uploadLocalAssetToMinIO('jaribakat.png', 'topics');
    const speakerAvatarUrl = await this.uploadLocalAssetToMinIO('jaribakat-banner-portrait.jpeg', 'speakers');

    // Update Banners in Database
    const banners = await this.bannersService.findAll();
    if (banners.length > 0) {
      if (banners[0]) {
        banners[0].desktopImage = banner1Url;
        banners[0].mobileImage = banner1MobUrl;
        await this.bannersService.update(banners[0].id, banners[0]);
      }
      if (banners[1]) {
        banners[1].desktopImage = banner2Url;
        banners[1].mobileImage = banner2MobUrl;
        await this.bannersService.update(banners[1].id, banners[1]);
      }
      if (banners[2]) {
        banners[2].desktopImage = banner3Url;
        banners[2].mobileImage = banner3MobUrl;
        await this.bannersService.update(banners[2].id, banners[2]);
      }
    }

    // Update Programs in Database
    const defaultSubCategories: Record<number, string> = {
      0: 'Webinar & Workshop',
      1: 'Webinar & Workshop',
      2: 'Online Group & Therapy',
      3: 'Belajar Mandiri',
      4: 'Offline Gathering',
      5: 'Mindfulness Community',
      6: 'Pelatihan Profesional',
    };

    const programs = await this.programsService.findAll();
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i];
      p.image = i % 3 === 0 ? banner1Url : i % 3 === 1 ? banner2Url : banner3Url;
      p.speakerImage = speakerAvatarUrl;
      if (!p.subCategory) {
        p.subCategory = defaultSubCategories[i] || 'Webinar & Workshop';
      }
      await this.programsService.update(p.id, p);
    }

    // Update Events in Database
    const events = await this.eventsService.findAll();
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      e.image = i % 3 === 0 ? banner1Url : i % 3 === 1 ? banner2Url : banner3Url;
      e.speakerImage = speakerAvatarUrl;
      await this.eventsService.update(e.id, e);
    }

    // Update Video Courses in Database
    const courses = await this.videoCoursesService.findAll();
    for (let i = 0; i < courses.length; i++) {
      const c = courses[i];
      await this.videoCoursesService.update(c.id, {
        image: i % 3 === 0 ? banner1Url : i % 3 === 1 ? banner2Url : banner3Url,
      });
    }

    // Update Topics in Database
    const topics = await this.topicsService.findAll();
    for (const t of topics) {
      await this.topicsService.update(t.id, { icon: topicIconUrl });
    }
  }

  private async seedUser() {
    const admin = await this.usersService.findByEmail('admin@jaribakat.com');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('jaribakatadmin@1', 10);
      await this.usersService.create({
        name: 'Admin JariBakat',
        email: 'admin@jaribakat.com',
        password: hashedPassword,
        role: 'admin',
      });
      this.logger.log('Created default admin user');
    }
  }

  private async seedSiteSettings() {
    const settings = await this.siteSettingsService.getAll();
    if (Object.keys(settings).length === 0) {
      await this.siteSettingsService.updateSettings({
        running_text: 'Tes Bakat & Fingerprint Analytics JariBakat',
        running_text_highlight: 'Paket Hemat Rp350.000',
        running_text_suffix: ' • Temukan Potensi Sejak Dini',
        running_text_cta_text: 'Pilih Paket Bakat',
        running_text_cta_href: '/event',
        running_text_bg_color: '#0F172A',
        running_text_main_color: '#FFFFFF',
        running_text_highlight_color: '#0D9488',
        running_text_cta_color: '#F59E0B',
        running_text_visible: 'true',
        whatsapp_number: '6285196235285',
        whatsapp_floating_visible: 'true',
        contact_email: 'info@jaribakat.com',
        copyright_text: '© 2025 Jaribakat. All rights reserved.',
        site_title: 'JariBakat - Tempat Bertumbuh Bersama',
        site_description: 'Platform Terbaik No.1 Indonesia untuk Tes Bakat & Sidik Jari Anak, Remaja, dan Keluarga.',
      });
      this.logger.log('Seeded site settings');
    }
  }

  private async seedBanners() {
    const banners = await this.bannersService.findAll();
    if (banners.length === 0) {
      const defaultSlides = [
        {
          desktopImage: `${BUCKET_BASE}/banners/banner-1.png`,
          mobileImage: `${BUCKET_BASE}/banners/banner-1-mobile.jpg`,
          alt: 'Paket Anak JariBakat - Menemukan Potensi Sejak Dini',
          ctaHref: '/event',
          ctaText: 'Lihat Paket Bakat Anak',
          ctaMobileText: 'Lihat Paket',
          sortOrder: 0,
        },
        {
          desktopImage: `${BUCKET_BASE}/banners/banner-2.jpg`,
          mobileImage: `${BUCKET_BASE}/banners/banner-2-mobile.jpg`,
          alt: 'JariBakat - Laporan Lengkap & Rekomendasi Pengembangan Diri',
          ctaHref: '/event',
          ctaText: 'Konsultasi Karir & Jurusan',
          ctaMobileText: 'Konsultasi',
          sortOrder: 1,
        },
        {
          desktopImage: `${BUCKET_BASE}/banners/banner-3.jpg`,
          mobileImage: `${BUCKET_BASE}/banners/banner-3-mobile.jpg`,
          alt: 'Promo Kemerdekaan JariBakat - Diskon Spesial Rp 250.000',
          ctaHref: '/event',
          ctaText: 'Lihat Paket Promo',
          ctaMobileText: 'Lihat Promo',
          sortOrder: 2,
        },
      ];
      for (const slide of defaultSlides) {
        await this.bannersService.create(slide);
      }
      this.logger.log('Seeded banner slides using storage bucket URLs');
    }
  }

  private async seedTopics() {
    const topics = await this.topicsService.findAll();
    if (topics.length === 0) {
      const defaultTopics = [
        { slug: 'gaya-belajar', name: 'Gaya Belajar', icon: `${BUCKET_BASE}/topics/topic-1.png`, href: '/topic?topic=gaya-belajar', sortOrder: 0 },
        { slug: 'potensi-anak', name: 'Potensi Bakat', icon: `${BUCKET_BASE}/topics/topic-2.png`, href: '/topic?topic=potensi-anak', sortOrder: 1 },
        { slug: 'jurusan-kuliah', name: 'Rekomendasi Jurusan', icon: `${BUCKET_BASE}/topics/topic-3.png`, href: '/topic?topic=jurusan-kuliah', sortOrder: 2 },
        { slug: 'perencanaan-karir', name: 'Perencanaan Karir', icon: `${BUCKET_BASE}/topics/topic-4.png`, href: '/topic?topic=perencanaan-karir', sortOrder: 3 },
        { slug: 'pola-asuh-orang-tua', name: 'Pola Asuh (Parenting)', icon: `${BUCKET_BASE}/topics/topic-5.png`, href: '/topic?topic=pola-asuh-orang-tua', sortOrder: 4 },
        { slug: 'tipe-kepribadian', name: 'Tipe Kepribadian', icon: `${BUCKET_BASE}/topics/topic-6.png`, href: '/topic?topic=tipe-kepribadian', sortOrder: 5 },
      ];
      for (const topic of defaultTopics) {
        await this.topicsService.create(topic);
      }
      this.logger.log('Seeded topic tags using storage bucket URLs');
    }
  }

  private async seedUSPs() {
    const usps = await this.uspsService.findAll();
    if (usps.length === 0) {
      const defaultUSPs = [
        { title: 'Menemukan Potensi Sejak Dini', description: 'Bukan sekadar "anak pintar", tapi tahu dia pintar di bidang apa. Arah jelas untuk masa depan tanpa meraba-raba.', sortOrder: 0 },
        { title: 'Meningkatkan Percaya Diri', description: 'Saat anak memahami kelebihannya, dia jadi lebih percaya diri, berani tampil, dan tidak mudah minder.', sortOrder: 1 },
        { title: 'Menghemat Waktu & Biaya', description: 'Daripada coba-coba les sana-sini, orang tua dapat langsung fokus memfasilitasi bidang yang memang sesuai minat bakat anak.', sortOrder: 2 },
        { title: 'Menghindari Salah Jurusan', description: 'Mengarahkan pilihan pendidikan dan karir berdasarkan kekuatan alami anak, bukan sekadar ikut-ikutan teman.', sortOrder: 3 },
        { title: 'Belajar Lebih Efektif', description: 'Memahami cara belajar terbaik anak (visual, auditori, kinestetik) agar proses belajar menjadi menyenangkan dan optimal.', sortOrder: 4 },
        { title: 'Mendidik dengan Data Tepat', description: 'Bukan lagi mendidik hanya dengan feeling, tapi berdasarkan data dan hasil pemindaian sidik jari yang objektif.', sortOrder: 5 },
      ];
      for (const usp of defaultUSPs) {
        await this.uspsService.create(usp);
      }
      this.logger.log('Seeded USPs');
    }
  }

  private async seedPrograms() {
    const programs = await this.programsService.findAll();
    if (programs.length === 0) {
      const defaultPrograms = [
        {
          slug: 'paket-anak',
          title: 'Paket Anak (Basic) – Analisa Potensi & Gaya Belajar',
          description: 'Analisa bakat & potensi dasar anak, gaya belajar (visual, auditori, kinestetik), rekomendasi pola mendidik & E-book panduan orang tua.',
          image: `${BUCKET_BASE}/programs/program-1.png`,
          category: ProgramCategory.ONLINE,
          subCategory: 'Webinar & Workshop',
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Certified Fingerprint Analyst JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-1.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Home Service / Center JariBakat',
          price: 'Rp 350.000',
          originalPrice: 'Rp 500.000',
          badge: 'Terpopuler',
          sortOrder: 0,
        },
        {
          slug: 'paket-remaja-dewasa',
          title: 'Paket Remaja & Dewasa (Premium) – Jurusan & Karir',
          description: 'Analisa minat & bakat spesifik, rekomendasi jurusan & karir, tipe kepribadian, potensi kerja & sertifikat resmi.',
          image: `${BUCKET_BASE}/programs/program-2.jpg`,
          category: ProgramCategory.ONLINE,
          subCategory: 'Webinar & Workshop',
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Career & Talent Specialist JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-2.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Center JariBakat',
          price: 'Rp 450.000',
          originalPrice: 'Rp 650.000',
          badge: 'Rekomendasi Karir',
          sortOrder: 1,
        },
        {
          slug: 'paket-2-anak',
          title: 'Paket 2 Anak (Hemat) – Sibling Analysis',
          description: 'Semua fitur Paket Anak untuk 2 anak sekaligus, perbandingan potensi kedua anak, dan insight pola asuh yang disesuaikan.',
          image: `${BUCKET_BASE}/programs/program-3.jpg`,
          category: ProgramCategory.ONLINE,
          subCategory: 'Online Group & Therapy',
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Parenting & Talent Specialist JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-3.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Center JariBakat',
          price: 'Rp 550.000',
          originalPrice: 'Rp 700.000',
          badge: 'Paket Hemat',
          sortOrder: 2,
        },
        {
          slug: 'paket-keluarga',
          title: 'Paket Keluarga (Best Value) – Family Harmony',
          description: 'Analisa lengkap seluruh anggota keluarga, kecocokan karakter, rekomendasi pola komunikasi, jurusan & karir.',
          image: `${BUCKET_BASE}/programs/program-4.jpg`,
          category: ProgramCategory.ONLINE,
          subCategory: 'Belajar Mandiri',
          speaker: 'Head Analyst JariBakat',
          speakerRole: 'Senior Fingerprint & Parenting Consultant',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-4.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online Consultation & Direct Report',
          price: 'Rp 750.000',
          originalPrice: 'Rp 1.000.000',
          badge: 'Best Value',
          sortOrder: 3,
        },
        {
          slug: 'fingerprint-roadshow',
          title: 'Roadshow Scanning Sidik Jari (School & Office)',
          description: 'Layanan pemindaian sidik jari tatap muka langsung bersama tim fasilitator JariBakat di sekolah atau event terdekat.',
          image: `${BUCKET_BASE}/programs/program-5.jpg`,
          category: ProgramCategory.OFFLINE,
          subCategory: 'Offline Gathering',
          speaker: 'Tim Fasilitator JariBakat',
          speakerRole: 'Senior Field Analyst JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-1.png`,
          date: 'Jadwal Komunitas / Sekolah',
          time: '09:00 - 15:00 WIB',
          location: 'Tatap Muka di Sekolah / Center',
          price: 'Rp 300.000',
          originalPrice: 'Rp 400.000',
          badge: 'Group Special',
          sortOrder: 0,
        },
        {
          slug: 'parenting-talk',
          title: 'Parenting Workshop & Talkshow',
          description: 'Workshop tatap muka memahami gaya belajar dan potensi tersembunyi anak berbasis data analisis sidik jari.',
          image: `${BUCKET_BASE}/programs/program-6.jpg`,
          category: ProgramCategory.OFFLINE,
          subCategory: 'Mindfulness Community',
          speaker: 'Tim Speaker JariBakat',
          speakerRole: 'Parenting & Educational Specialist',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-2.png`,
          date: 'Jadwal Akhir Pekan',
          time: '10:00 - 12:30 WIB',
          location: 'Auditorium / Grand Ballroom',
          price: 'Rp 250.000',
          originalPrice: 'Rp 350.000',
          badge: 'Workshop',
          sortOrder: 1,
        },
        {
          slug: 'consultant-certified',
          title: 'Konsultasi Expert Analyst JariBakat (1-on-1)',
          description: 'Sesi konsultasi 1-on-1 mendalam bersama Analyst & Konsultan JariBakat bersertifikat untuk membedah hasil laporan.',
          image: `${BUCKET_BASE}/programs/program-7.jpg`,
          category: ProgramCategory.EXPERT,
          subCategory: 'Pelatihan Profesional',
          speaker: 'Tim Certified Analyst JariBakat',
          speakerRole: 'Fingerprint & Talent Specialist JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-3.png`,
          date: 'Jadwal Perjanjian',
          time: '60 Menit / Sesi',
          location: 'Virtual Zoom / Private Center',
          price: 'Rp 600.000',
          originalPrice: 'Rp 850.000',
          badge: 'Exclusive',
          sortOrder: 0,
        },
      ];
      for (const prog of defaultPrograms) {
        await this.programsService.create(prog as any);
      }
      this.logger.log('Seeded programs using storage bucket URLs');
    }
  }

  private async seedEvents() {
    const events = await this.eventsService.findAll();
    if (events.length === 0) {
      const defaultEvents = [
        {
          title: 'Paket Anak (Basic) - Analisa Potensi & Gaya Belajar',
          type: 'Tes Bakat Anak',
          category: EventCategory.ONLINE,
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Certified Fingerprint Analyst JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-1.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Home Service / Center JariBakat',
          image: `${BUCKET_BASE}/events/event-1.png`,
          price: 'Rp 350.000',
          originalPrice: 'Rp 500.000',
          badge: 'Terpopuler',
          href: 'https://wa.me/6285196235285',
          sortOrder: 0,
        },
        {
          title: 'Paket Remaja & Dewasa (Premium) - Jurusan & Karir',
          type: 'Tes Bakat & Karir',
          category: EventCategory.ONLINE,
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Career & Talent Specialist JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-2.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Center JariBakat',
          image: `${BUCKET_BASE}/events/event-2.jpg`,
          price: 'Rp 450.000',
          originalPrice: 'Rp 650.000',
          badge: 'Rekomendasi Karir',
          href: 'https://wa.me/6285196235285',
          sortOrder: 1,
        },
        {
          title: 'Paket 2 Anak (Hemat) - Analisa & Perbandingan Potensi Sibling',
          type: 'Tes Bakat 2 Anak',
          category: EventCategory.ONLINE,
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Parenting & Talent Specialist JariBakat',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-3.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Center JariBakat',
          image: `${BUCKET_BASE}/events/event-3.jpg`,
          price: 'Rp 550.000',
          originalPrice: 'Rp 700.000',
          badge: 'Paket Hemat',
          href: 'https://wa.me/6285196235285',
          sortOrder: 2,
        },
        {
          title: 'Paket Keluarga (Best Value) - Harmony & Pola Asuh Komprehensif',
          type: 'Tes Bakat Keluarga',
          category: EventCategory.EXPERT,
          speaker: 'Head Analyst JariBakat',
          speakerRole: 'Senior Fingerprint & Parenting Consultant',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-4.png`,
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online Consultation & Direct Report',
          image: `${BUCKET_BASE}/events/event-4.jpg`,
          price: 'Rp 750.000',
          originalPrice: 'Rp 1.000.000',
          badge: 'Best Value',
          href: 'https://wa.me/6285196235285',
          sortOrder: 3,
        },
      ];
      for (const evt of defaultEvents) {
        await this.eventsService.create(evt as any);
      }
      this.logger.log('Seeded event catalog items using storage bucket URLs');
    }
  }

  private async seedVideoCourses() {
    const courses = await this.videoCoursesService.findAll();
    if (courses.length === 0) {
      const defaultCourses = [
        {
          slug: 'mengenal-dan-menghadapi-pemicu-emosi',
          title: 'Mengenal dan Menghadapi Pemicu Emosi',
          category: 'Emotion',
          views: 137,
          lessons: 4,
          duration: '1h 06m',
          rating: 5.0,
          reviewsCount: 12,
          originalPrice: 'Rp75,000',
          price: 'Rp70,000',
          image: `${BUCKET_BASE}/video-courses/course-1.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 0,
        },
        {
          slug: 'memahami-trauma-terselubung',
          title: 'Memahami Trauma Terselubung Dibalik Hubungan Penuh Drama',
          category: 'Trauma',
          views: 191,
          lessons: 5,
          duration: '1h 24m',
          rating: 4.9,
          reviewsCount: 28,
          originalPrice: 'Rp85,000',
          price: 'Rp70,000',
          image: `${BUCKET_BASE}/video-courses/course-2.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 1,
        },
        {
          slug: 'memulihkan-trauma-narsistik',
          title: 'Memulihkan Trauma dari Hubungan dengan Narsistik',
          category: 'Trauma',
          views: 656,
          lessons: 6,
          duration: '1h 40m',
          rating: 5.0,
          reviewsCount: 45,
          originalPrice: 'Rp90,000',
          price: 'Rp70,000',
          image: `${BUCKET_BASE}/video-courses/course-3.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 2,
        },
        {
          slug: 'saatnya-bangkit-dari-depresi',
          title: 'Saatnya Bangkit Dari Depresi',
          category: 'Depresi',
          views: 420,
          lessons: 5,
          duration: '1h 15m',
          rating: 4.8,
          reviewsCount: 34,
          originalPrice: 'Rp75,000',
          price: 'Rp70,000',
          image: `${BUCKET_BASE}/video-courses/course-4.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 3,
        },
        {
          slug: 'seni-mengelola-overthinking',
          title: 'Seni Mengelola Pikiran Overthinking & Anxiety',
          category: 'Anxiety',
          views: 892,
          lessons: 7,
          duration: '2h 05m',
          rating: 5.0,
          reviewsCount: 67,
          originalPrice: 'Rp95,000',
          price: 'Rp75,000',
          image: `${BUCKET_BASE}/video-courses/course-5.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 4,
        },
        {
          slug: 'berdamai-dengan-luka-pengasuhan',
          title: 'Berdamai dengan Luka Pengasuhan Masa Lalu (Inner Child)',
          category: 'Parenting',
          views: 512,
          lessons: 6,
          duration: '1h 45m',
          rating: 4.9,
          reviewsCount: 51,
          originalPrice: 'Rp85,000',
          price: 'Rp70,000',
          image: `${BUCKET_BASE}/video-courses/course-6.jpg`,
          href: 'https://wa.me/6285196235285',
          sortOrder: 5,
        },
      ];
      for (const course of defaultCourses) {
        await this.videoCoursesService.create(course);
      }
      this.logger.log('Seeded video courses using storage bucket URLs');
    }
  }

  private async seedCommunities() {
    const comms = await this.communitiesService.findAll();
    if (comms.length === 0) {
      const defaultComms = [
        { name: 'Komunitas Orang Tua JariBakat', href: '/community', sortOrder: 0 },
        { name: 'Komunitas Bakat & Karir Remaja', href: '/community', sortOrder: 1 },
        { name: 'Komunitas Gaya Belajar Efektif', href: '/community', sortOrder: 2 },
        { name: 'Komunitas Harmony Keluarga JariBakat', href: '/community', sortOrder: 3 },
      ];
      for (const comm of defaultComms) {
        await this.communitiesService.create(comm);
      }
      this.logger.log('Seeded community links');
    }
  }

  private async seedFAQs() {
    const faqs = await this.faqsService.findAll();
    if (faqs.length === 0) {
      const defaultFAQs = [
        {
          category: 'Umum',
          question: 'Apa itu JariBakat?',
          answer: 'JariBakat adalah Platform Terbaik No.1 Indonesia untuk analisis tes bakat dan sidik jari (fingerprint test). Kami membantu orang tua, pelajar, dan keluarga mengetahui potensi alami, gaya belajar, serta rekomendasi jurusan & karir secara objektif berbasis data.',
          sortOrder: 0,
        },
        {
          category: 'Layanan',
          question: 'Bagaimana cara melakukan tes sidik jari JariBakat?',
          answer: 'Kamu cukup memilih paket yang sesuai (Paket Anak, Remaja & Dewasa, 2 Anak, atau Paket Keluarga), kemudian melakukan proses pendaftaran. Pemindaian sidik jari dapat dilakukan secara fleksibel dan laporan lengkap akan disusun oleh tim analis JariBakat.',
          sortOrder: 1,
        },
        {
          category: 'Manfaat',
          question: 'Mengapa tes bakat sidik jari penting bagi anak?',
          answer: 'Tes bakat sidik jari membantu menemukan potensi alami sejak dini, mengetahui gaya belajar terbaik (visual, auditori, kinestetik), menghemat biaya les yang tidak perlu, dan mencegah risiko salah jurusan di perguruan tinggi.',
          sortOrder: 2,
        },
        {
          category: 'Paket',
          question: 'Apa saja pilihan paket layanan di JariBakat?',
          answer: 'Kami menyediakan Paket Anak (Basic) Rp 350.000, Paket Remaja & Dewasa (Premium) Rp 450.000, Paket 2 Anak (Hemat) Rp 550.000, dan Paket Keluarga (Best Value) Rp 750.000.',
          sortOrder: 3,
        },
        {
          category: 'Konsultasi',
          question: 'Apakah peserta mendapatkan konsultasi hasil laporan?',
          answer: 'Ya! Untuk paket Premium dan Keluarga, Anda akan mendapatkan sesi konsultasi pembahasan hasil laporan langsung bersama konsultan teruji dari JariBakat.',
          sortOrder: 4,
        },
      ];
      for (const faq of defaultFAQs) {
        await this.faqsService.create(faq);
      }
      this.logger.log('Seeded FAQs');
    }
  }

  private async seedPages() {
    const pages = await this.pagesService.findAll();
    if (pages.length === 0) {
      await this.pagesService.create({
        slug: 'about-us',
        title: 'Tentang JariBakat',
        heroBadge: 'Platform Terbaik No.1 Indonesia',
        heroTitle: 'Tentang JariBakat',
        heroDescription: 'JariBakat merupakan platform analisis tes bakat & sidik jari (fingerprint test) terdepan di Indonesia.',
        bodyContent: 'Bukan sekadar "anak pintar", tapi tahu dia pintar di bidang apa.',
        ctaText: 'Keunggulan Kami',
        ctaHref: '#about-story',
      });
      await this.pagesService.create({
        slug: 'expert',
        title: 'Expert Class JariBakat',
        heroBadge: 'Konsultasi Analyst & Sertifikat Resmi',
        heroTitle: 'Consultant & Analyst Class JariBakat',
        heroDescription: 'Sesi konsultasi 1-on-1 mendalam bersama Analyst & Konsultan JariBakat bersertifikat.',
        ctaText: 'Pelajari Konsultasi',
        ctaHref: '#expert-class-detail',
      });
      this.logger.log('Seeded static pages');
    }
  }

  private async seedFooter() {
    const sections = await this.footerService.findAll();
    if (sections.length === 0) {
      const sec1 = await this.footerService.createSection('Kenali JariBakat', 0);
      await this.footerService.addLink(sec1.id, 'Tentang JariBakat', '/about-us', false, 0);
      await this.footerService.addLink(sec1.id, 'Paket Layanan', '/event', false, 1);
      await this.footerService.addLink(sec1.id, 'Keunggulan Tes', '/about-us#about-story', false, 2);
      await this.footerService.addLink(sec1.id, 'FAQ', '/faq', false, 3);

      const sec2 = await this.footerService.createSection('Layanan Bakat', 1);
      await this.footerService.addLink(sec2.id, 'Paket Anak (Basic)', '/event', false, 0);
      await this.footerService.addLink(sec2.id, 'Paket Remaja & Dewasa', '/event', false, 1);
      await this.footerService.addLink(sec2.id, 'Paket 2 Anak (Hemat)', '/event', false, 2);
      await this.footerService.addLink(sec2.id, 'Paket Keluarga (Best Value)', '/expert', false, 3);

      const sec3 = await this.footerService.createSection('Informasi & Kontak', 2);
      await this.footerService.addLink(sec3.id, 'Konsultasi Member', 'https://member.jaribakat.com/login', true, 0);
      await this.footerService.addLink(sec3.id, 'Hubungi Customer Support', 'https://wa.me/6285196235285', true, 1);

      this.logger.log('Seeded footer sections');
    }
  }
}
