import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Executing complete database seeder...');
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
    this.logger.log('Database seeding finished successfully!');
  }

  private async seedUser() {
    const admin = await this.usersService.findByEmail('admin@jaribakat.com');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123456', 10);
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
          desktopImage: '/images/banner-jaribakat.png',
          mobileImage: '/images/WhatsApp%20Image%202026-07-25%20at%205.04.01%20PM(1).jpeg',
          alt: 'Paket Anak JariBakat - Menemukan Potensi Sejak Dini',
          ctaHref: '/event',
          ctaText: 'Lihat Paket Bakat Anak',
          ctaMobileText: 'Lihat Paket',
          sortOrder: 0,
        },
        {
          desktopImage: '/images/banner-landscape2.jpeg',
          mobileImage: '/images/WhatsApp%20Image%202026-07-25%20at%205.24.43%20PM.jpeg',
          alt: 'JariBakat - Laporan Lengkap & Rekomendasi Pengembangan Diri',
          ctaHref: '/event',
          ctaText: 'Konsultasi Karir & Jurusan',
          ctaMobileText: 'Konsultasi',
          sortOrder: 1,
        },
        {
          desktopImage: '/images/banner-landscape3.jpeg',
          mobileImage: '/images/WhatsApp%20Image%202026-07-25%20at%205.12.44%20PM.jpeg',
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
      this.logger.log('Seeded banner slides');
    }
  }

  private async seedTopics() {
    const topics = await this.topicsService.findAll();
    if (topics.length === 0) {
      const defaultTopics = [
        { slug: 'gaya-belajar', name: 'Gaya Belajar', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/ewux9RyU0p4TsmqtgdWb3c8LTmV3RlC6Xp2zkGjC.svg', href: '/topic?topic=gaya-belajar', sortOrder: 0 },
        { slug: 'potensi-anak', name: 'Potensi Bakat', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/xOvPj8ho04rwvu6Hf8J63I5r9FwqsvvCzyTpAWCt.svg', href: '/topic?topic=potensi-anak', sortOrder: 1 },
        { slug: 'jurusan-kuliah', name: 'Rekomendasi Jurusan', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/eTzbzFvPSQDMg3LORp3slxz8HV4cI6mo98VhPVYs.svg', href: '/topic?topic=jurusan-kuliah', sortOrder: 2 },
        { slug: 'perencanaan-karir', name: 'Perencanaan Karir', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/RpGINdkQxCiqWoTUOaDEI5Sa49tKKLc9chcECyTP.svg', href: '/topic?topic=perencanaan-karir', sortOrder: 3 },
        { slug: 'pola-asuh-orang-tua', name: 'Pola Asuh (Parenting)', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/NbCyx5ew3YvMCpcFP6cGpExelzP6TkqAJE2LV0XN.svg', href: '/topic?topic=pola-asuh-orang-tua', sortOrder: 4 },
        { slug: 'tipe-kepribadian', name: 'Tipe Kepribadian', icon: 'https://storage.googleapis.com/insightme-production/file/topic/thumb/xP9agFyrFfL1tsJ3CPhHJkfYLV1eceSpMCJJ7s2B.svg', href: '/topic?topic=tipe-kepribadian', sortOrder: 5 },
      ];
      for (const topic of defaultTopics) {
        await this.topicsService.create(topic);
      }
      this.logger.log('Seeded topic tags');
    }
  }

  private async seedUSPs() {
    const usps = await this.uspsService.findAll();
    if (usps.length === 0) {
      const defaultUSPs = [
        { title: 'Menemukan Potensi Sejak Dini', description: 'Bukan sekadar "anak pintar", tapi tahu dia pintar di bidang apa.', sortOrder: 0 },
        { title: 'Meningkatkan Percaya Diri', description: 'Saat anak memahami kelebihannya, dia jadi lebih percaya diri.', sortOrder: 1 },
        { title: 'Menghemat Waktu & Biaya', description: 'Daripada coba-coba les sana-sini, fokus memfasilitasi bidang yang sesuai.', sortOrder: 2 },
        { title: 'Menghindari Salah Jurusan', description: 'Mengarahkan pilihan pendidikan dan karir berdasarkan kekuatan alami.', sortOrder: 3 },
        { title: 'Belajar Lebih Efektif', description: 'Memahami cara belajar terbaik anak (visual, auditori, kinestetik).', sortOrder: 4 },
        { title: 'Mendidik dengan Data Tepat', description: 'Bukan mendidik hanya dengan feeling, tapi berdasarkan data pemindaian sidik jari.', sortOrder: 5 },
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
          description: 'Analisa bakat & potensi dasar anak, gaya belajar, rekomendasi pola mendidik.',
          image: 'https://storage.googleapis.com/insightme-production/file/program/thumb/PNvr7ONxw3sgrs4KaCVMcIqgSFhevxkxV3kQBFzy.png',
          category: ProgramCategory.ONLINE,
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Certified Fingerprint Analyst JariBakat',
          speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-1.png',
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
          description: 'Analisa minat & bakat spesifik, rekomendasi jurusan & karir, tipe kepribadian.',
          image: 'https://storage.googleapis.com/insightme-production/file/program/thumb/mhz5McXb5A0QNLTFTGSVuMiYg7XU7Cc8fcaMEI9F.png',
          category: ProgramCategory.ONLINE,
          speaker: 'Tim Konsultan JariBakat',
          speakerRole: 'Career & Talent Specialist JariBakat',
          speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-2.png',
          date: 'Akses Fleksibel',
          time: 'Sesuai Jadwal Pilihan',
          location: 'Online / Center JariBakat',
          price: 'Rp 450.000',
          originalPrice: 'Rp 650.000',
          badge: 'Best Value',
          sortOrder: 1,
        },
        {
          slug: 'fingerprint-roadshow',
          title: 'Roadshow Scanning Sidik Jari (School & Office)',
          description: 'Layanan pemindaian sidik jari tatap muka langsung bersama tim fasilitator JariBakat.',
          image: 'https://storage.googleapis.com/insightme-production/file/program/thumb/PNvr7ONxw3sgrs4KaCVMcIqgSFhevxkxV3kQBFzy.png',
          category: ProgramCategory.OFFLINE,
          speaker: 'Tim Fasilitator JariBakat',
          speakerRole: 'Senior Field Analyst JariBakat',
          speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-1.png',
          date: 'Jadwal Komunitas / Sekolah',
          time: '09:00 - 15:00 WIB',
          location: 'Tatap Muka di Sekolah / Center',
          price: 'Rp 300.000',
          originalPrice: 'Rp 400.000',
          badge: 'Group Special',
          sortOrder: 0,
        },
        {
          slug: 'consultant-certified',
          title: 'Konsultasi Expert Analyst JariBakat (1-on-1)',
          description: 'Sesi konsultasi 1-on-1 mendalam bersama Analyst & Konsultan JariBakat bersertifikat.',
          image: 'https://storage.googleapis.com/insightme-production/file/program/thumb/qcilu5bVlP9fVXKvLswMJsNi8P9SzH556aVYMrnT.webp',
          category: ProgramCategory.EXPERT,
          speaker: 'Tim Certified Analyst JariBakat',
          speakerRole: 'Fingerprint & Talent Specialist JariBakat',
          speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-2.png',
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
      this.logger.log('Seeded programs');
    }
  }

  private async seedEvents() {
    const events = await this.eventsService.findAll();
    if (events.length === 0) {
      const defaultEvents = [
        { title: 'Paket Anak (Basic) - Analisa Potensi & Gaya Belajar', type: 'Tes Bakat Anak', category: EventCategory.ONLINE, speaker: 'Tim Konsultan JariBakat', speakerRole: 'Certified Fingerprint Analyst JariBakat', speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-1.png', image: 'https://storage.googleapis.com/insightme-production/file/hqm3bDj6PfkXwdvB4LU0JunSLd8yyLU8nJqKqQWR.webp', price: 'Rp 350.000', badge: 'Terpopuler', sortOrder: 0 },
        { title: 'Paket Remaja & Dewasa (Premium) - Jurusan & Karir', type: 'Tes Bakat & Karir', category: EventCategory.ONLINE, speaker: 'Tim Konsultan JariBakat', speakerRole: 'Career & Talent Specialist JariBakat', speakerImage: 'https://storage.googleapis.com/insightme-production/file/speaker/thumb/speaker-2.png', image: 'https://storage.googleapis.com/insightme-production/file/cHaVs1OBQJiZF9dfWDnkM9i1WHZvV5w6oltkoiXh.webp', price: 'Rp 450.000', badge: 'Rekomendasi Karir', sortOrder: 1 },
      ];
      for (const evt of defaultEvents) {
        await this.eventsService.create(evt);
      }
      this.logger.log('Seeded event catalog items');
    }
  }

  private async seedVideoCourses() {
    const courses = await this.videoCoursesService.findAll();
    if (courses.length === 0) {
      const defaultCourses = [
        { slug: 'mengenal-dan-menghadapi-pemicu-emosi', title: 'Mengenal dan Menghadapi Pemicu Emosi', category: 'Emotion', views: 137, lessons: 4, duration: '1h 06m', rating: 5.0, reviewsCount: 12, originalPrice: 'Rp75,000', price: 'Rp70,000', image: 'https://storage.googleapis.com/insightme-production/file/okrMS3jj0AIoBiRah4pQCGF2f3FCb21Biuh9V80z.webp', sortOrder: 0 },
        { slug: 'memahami-trauma-terselubung', title: 'Memahami Trauma Terselubung Dibalik Hubungan Penuh Drama', category: 'Trauma', views: 191, lessons: 5, duration: '1h 24m', rating: 4.9, reviewsCount: 28, originalPrice: 'Rp85,000', price: 'Rp70,000', image: 'https://storage.googleapis.com/insightme-production/file/YjXcmgeygsSWntuBCrwQwvUdtntPE7mCNz2tJbQt.webp', sortOrder: 1 },
      ];
      for (const course of defaultCourses) {
        await this.videoCoursesService.create(course);
      }
      this.logger.log('Seeded video courses');
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
        { category: 'Umum', question: 'Apa itu JariBakat?', answer: 'JariBakat adalah Platform Terbaik No.1 Indonesia untuk analisis tes bakat dan sidik jari (fingerprint test).', sortOrder: 0 },
        { category: 'Layanan', question: 'Bagaimana cara melakukan tes sidik jari JariBakat?', answer: 'Kamu cukup memilih paket yang sesuai, kemudian melakukan pendaftaran.', sortOrder: 1 },
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
      });
      await this.pagesService.create({
        slug: 'expert',
        title: 'Expert Class JariBakat',
        heroBadge: 'Konsultasi Analyst & Sertifikat Resmi',
        heroTitle: 'Consultant & Analyst Class JariBakat',
        heroDescription: 'Sesi konsultasi 1-on-1 mendalam bersama Analyst & Konsultan JariBakat bersertifikat.',
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
      await this.footerService.addLink(sec1.id, 'FAQ', '/faq', false, 2);

      const sec2 = await this.footerService.createSection('Layanan Bakat', 1);
      await this.footerService.addLink(sec2.id, 'Paket Anak (Basic)', '/event', false, 0);
      await this.footerService.addLink(sec2.id, 'Paket Remaja & Dewasa', '/event', false, 1);

      this.logger.log('Seeded footer sections');
    }
  }
}
