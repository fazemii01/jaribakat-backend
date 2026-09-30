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
import { ArticlesService } from '../articles/articles.service';

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
    private readonly articlesService: ArticlesService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Executing initial seeds verification...');
    await this.syncFavicons();
    await this.seedUser();
    await this.seedArticles();
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
    } catch (err: any) {
      this.logger.warn('Notice syncing favicons: ' + (err?.message || err));
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
    } catch (err: any) {
      this.logger.warn(`Notice uploading local asset ${fileName} to MinIO: ` + (err?.message || err));
    }

    return `${BUCKET_BASE}/${folder}/${fileName}`;
  }

  async seedArticles() {
    try {
      const articles = await this.articlesService.findAll();
      const existingSlugs = new Set(articles.map((a) => a.slug));

      const defaultArticles = [
        {
          title: 'Bukan Kurang Pintar, Tapi Salah Pola: Rahasia Menemukan Cetak Biru Bakat Alami Anak Sejak Dini',
          slug: 'bukan-kurang-pintar-tapi-salah-pola',
          coverImage: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80',
          category: 'Parenting & Edukasi',
          excerpt: 'Sering merasa lelah menghadapi anak yang susah fokus atau dicap malas? Sebelum Anda merasa gagal menjadi orang tua, pahami bagaimana sains sidik jari biometrik dan stimulasi sensori membuka potensi tersembunyi buah hati Anda.',
          author: 'Tim Analis JariBakat & Allia FPA',
          authorRole: 'Senior Fingerprint & Parenting Consultant',
          readingTime: '5 menit baca',
          status: 'published' as const,
          contentBlocks: JSON.stringify([
            {
              id: 'fb-1',
              type: 'heading',
              content: 'Kisah di Balik Meja Belajar: Jeritan Hati yang Kerap Terabaikan',
            },
            {
              id: 'fb-2',
              type: 'paragraph',
              content: 'Hampir setiap malam di jutaan rumah keluarga Indonesia, drama yang sama berulang. Jam menunjukkan pukul delapan malam, buku pelajaran masih terbuka di halaman yang sama, dan suasana meja belajar mulai memanas. Ada suara orang tua yang meninggi karena letih seharian beraktivitas, dan ada air mata anak yang tertunduk lesu di balik tumpukan buku PR-nya.\n\nDalam hati sang ibu atau ayah, berkecamuk rasa cemas yang menusuk: "Di mana letak salah saya mendidik? Kenapa anak tetangga bisa duduk tenang membaca, sementara anak saya lima menit saja sudah gelisah memutar-mutar pensil dan tidak fokus?"',
            },
            {
              id: 'fb-3',
              type: 'paragraph',
              content: 'Sebagian besar orang tua yang datang ke JariBakat membawa beban kecemasan yang serupa. Mereka telah mencoba mendaftarkan anak ke bimbingan belajar termahal, membatasi gawai, hingga menjanjikan berbagai hadiah. Namun hasilnya tetap sama: nilai sekolah tak kunjung membaik, anak semakin tertekan, dan kehangatan hubungan keluarga perlahan terkikis oleh bentakan demi bentakan setiap hari.',
            },
            {
              id: 'fb-4',
              type: 'heading',
              content: "Kebenaran Ilmiah: Otak Setiap Anak Memiliki 'Cetak Biru' yang Unik",
            },
            {
              id: 'fb-5',
              type: 'paragraph',
              content: 'Albert Einstein pernah merumuskan refleksi abadi: "Semua anak terlahir genius. Namun jika Anda menilai seekor ikan dari kemampuannya memanjat pohon, ia akan menjalani seluruh hidupnya dengan meyakini bahwa dirinya bodoh."\n\nDi JariBakat dan Allia FPA, kami membuktikan prinsip ini setiap hari melalui sains Dermatoglyphics (analisis pola guratan biometrik sidik jari). Sains neurologi perkembangan membuktikan bahwa pola sidik jari terbentuk di minggu ke-13 hingga ke-19 masa kehamilan, bersamaan persis dengan pembentukan lapisan neocortex dan sistem saraf pusat otak janin.',
            },
            {
              id: 'fb-6',
              type: 'quote',
              content: 'Setiap guratan di ujung jemari anak Anda bukanlah kebetulan. Itu adalah peta biologis alami yang merefleksikan bagaimana 10 bagian otak mereka memproses informasi, mengelola emosi, dan merespons dunia luar.',
              author: 'Tim Analis Biometrik JariBakat & Allia FPA',
            },
            {
              id: 'fb-7',
              type: 'heading',
              content: 'Nature vs. Nurture: Mengapa Tes Sidik Jari Bukan Ramalan, Melainkan Kompas',
            },
            {
              id: 'fb-8',
              type: 'paragraph',
              content: 'Banyak orang tua keliru mengira tes sidik jari adalah ramalan masa depan. Tentu bukan. Sains biometrik sidik jari memotret "Nature" (potensi bawaan lahir), sementara pola asuh, nutrisi, dan lingkungan adalah "Nurture" (penyiraman dan pemupukan).\n\nBayangkan jika anak Anda terlahir sebagai benih pohon mangga yang manis, tetapi Anda terus memaksanya menghasilkan buah apel karena tren masyarakat menuntut apel. Sampai kapan pun Anda akan kecewa, dan sang pohon mangga akan layu sebelum sempat berbuah lebat.\n\nDengan memetakan 10 fungsi belahan otak, JariBakat membantu orang tua mengenali apakah anak lebih dominan di belahan otak kiri (logika analitis, bahasa sekuensial) atau otak kanan (imajinasi spasial, intuisi emosional, konseptual makro).',
            },
            {
              id: 'fb-9',
              type: 'heading',
              content: '3 Tipe Gaya Belajar: Kunci Membuka Potensi Tersembunyi',
            },
            {
              id: 'fb-10',
              type: 'paragraph',
              content: 'Tahukah Anda mengapa anak yang dicap "tidak bisa diam" sering kali merupakan anak dengan bakat kinestetik luar biasa?\n\n1. Anak Tipe Kinestetik: Otak mereka baru menyerap informasi saat tubuh bergerak. Memaksa mereka duduk kaku selama 2 jam membaca teks hitam-putih ibarat mematikan saklar pemahaman mereka. Mereka butuh alat peraga, eksperimen fisik, dan sentuhan nyata.\n\n2. Anak Tipe Visual: Mereka berpikir dalam bentuk gambar, warna, dan bagan visual. Penjelasan verbal panjang lebar tanpa ilustrasi hanya akan lewat bagai angin lalu.\n\n3. Anak Tipe Auditori: Sangat peka pada intonasi suara, dongeng berirama, dan diskusi dua arah. Mereka belajar paling efektif dengan mendengarkan penjelasan lisan atau berdiskusi aktif.',
            },
            {
              id: 'fb-11',
              type: 'quote',
              content: 'Ketika orang tua mulai mendidik dengan bahasa alami sang anak, belajar tidak lagi menjadi ajang perang urat saraf di rumah, melainkan petualangan menyenangkan yang dinantikan setiap hari.',
              author: 'Konsultan Perkembangan Anak JariBakat',
            },
            {
              id: 'fb-12',
              type: 'heading',
              content: 'Bukan Hanya Tes Sidik Jari: Ekosistem Pendampingan Menyeluruh',
            },
            {
              id: 'fb-13',
              type: 'paragraph',
              content: 'JariBakat tidak berhenti hanya pada selembar dokumen hasil tes. Melalui integrasi ekosistem Allia FPA, kami melengkapi analisis genetik anak dengan pendampingan perkembangan nyata:\n\n• Skrining Dini KPSP & Sensori: Mendeteksi dini hambatan wicara (speech delay), intoleransi tekstur makanan (picky eater), dan integrasi motorik anak sejak usia emas (golden age).\n\n• Rekomendasi Pola Asuh & Bahasa Kasih (Love Language): Memandu orang tua cara mengapresiasi, menegakkan disiplin tanpa melukai harga diri anak, dan memilih ekstrakurikuler yang tepat sasaran.\n\n• Konsultasi Privat 1-on-1: Setiap laporan hasil tes dibahas tuntas bersama konsultan profesional kami untuk menyusun peta aksi stimulasi yang realistis dan aplikatif di rumah.',
            },
            {
              id: 'fb-14',
              type: 'heading',
              content: 'Langkah Pertama: Beri Hadiah Terbaik untuk Masa Depan Buah Hati',
            },
            {
              id: 'fb-15',
              type: 'paragraph',
              content: 'Masa kecil anak berlalu sangat cepat dan tidak bisa diulang. Jangan biarkan masa emas mereka habis untuk memperbaiki kelemahan yang dipaksakan, sementara kekuatan dan bakat sejatinya justru layu tak tersentuh.\n\nKenali keunikan buah hati Anda hari ini. Bersama JariBakat, mari kita dampingi anak bertumbuh menjadi versi terbaik dari potensi alaminya sendiri — bahagia, percaya diri, dan siap meraih masa depannya.',
            },
          ]),
        },
        {
          title: 'Mengapa Membandingkan Anak Merusak Potensi Otaknya? Sains Keunikan Sidik Jari JariBakat',
          slug: 'mengapa-membandingkan-anak-merusak-potensi-otak',
          coverImage: '/images/banners/uyoGr.png',
          category: 'Parenting & Edukasi',
          excerpt: 'Membandingkan anak dengan saudara atau temannya tidak membuatnya termotivasi, melainkan memicu stres amygdala dan mematikan fitrah belajarnya. Pahami sains biologis keunikan 10 fungsi otak bersama JariBakat.',
          author: 'Tim Analis JariBakat & Allia FPA',
          authorRole: 'Senior Fingerprint & Parenting Consultant',
          readingTime: '5 menit baca',
          status: 'published' as const,
          contentBlocks: JSON.stringify([
            {
              id: 'mb-1',
              type: 'heading',
              content: 'Niat Memotivasi yang Berujung Luka Batin Anak',
            },
            {
              id: 'mb-2',
              type: 'paragraph',
              content: 'Tanpa sadar, banyak orang tua melontarkan kalimat seperti: "Lihat tuh kakakmu, selalu rajin dan nilainya bagus. Kenapa kamu nggak bisa seperti dia?" Niat orang tua mulia: ingin memacu semangat anak. Namun di level neurologis, otak anak merespons kalimat perbandingan tersebut sebagai ancaman eksistensial.',
            },
            {
              id: 'mb-3',
              type: 'paragraph',
              content: 'Ketika anak dibandingkan, bagian otak yang bernama amygdala membunyikan alarm bahaya. Hormon kortisol dan adrenalin membanjiri sistem saraf, memicu respons fight-or-flight. Akibatnya, prefrontal cortex — pusat logika, kreativitas, dan memori kerja — seketika lumpuh. Anak bukannya semakin pintar, melainkan semakin defensif, cemas, atau menarik diri dalam keputusasaan.',
            },
            {
              id: 'mb-4',
              type: 'heading',
              content: 'Sains Membuktikan: Tidak Ada Dua Sidik Jari yang Sama di Dunia',
            },
            {
              id: 'mb-5',
              type: 'paragraph',
              content: 'Sejak abad ke-19, sains dermatoglyphics dan genetika telah membuktikan bahwa probabilitas dua orang memiliki pola sidik jari yang identik adalah 1 berbanding 64 miliar. Bahkan anak kembar identik sekalipun memiliki guratan sidik jari dan peta koneksi saraf otak yang berbeda.',
            },
            {
              id: 'mb-6',
              type: 'quote',
              content: 'Membandingkan dua anak adalah kekeliruan biologis. Setiap anak memiliki konfigurasi 10 bagian otak yang dirancang khusus untuk misi kehidupan yang berbeda-beda.',
              author: 'Dr. Hendrawan, Peneliti Neurosains & Biometrik',
            },
            {
              id: 'mb-7',
              type: 'heading',
              content: '10 Belahan Otak & Gaya Respon Alami',
            },
            {
              id: 'mb-8',
              type: 'paragraph',
              content: 'Melalui pemindaian 10 jari di JariBakat, kami memetakan kekuatan di masing-masing lobus otak anak:\n\n• Prefrontal Kanan vs Kiri: Menentukan apakah anak seorang perancang strategi visioner atau eksekutor disiplin yang taat prosedur.\n\n• Frontal Kanan vs Kiri: Mengungkap apakah anak berpikir kreatif asosiatif atau analitis logis matematis.\n\n• Parietal: Menunjukkan kecerdasan spasial 3 dimensi dan sensitivitas kinestetik motorik.\n\n• Temporal: Membedakan kepekaan musikal emosional dengan ketajaman memori bahasa.\n\n• Occipital: Mengukur kemampuan observasi visual dan pemahaman pola abstrak.',
            },
            {
              id: 'mb-9',
              type: 'heading',
              content: 'Transformasi Pola Asuh: Dari Membandingkan Menjadi Menguatkan',
            },
            {
              id: 'mb-10',
              type: 'paragraph',
              content: 'Ketika Anda mengetahui peta bakat unik buah hati, Anda tidak lagi terobsesi menjadikan anak fotokopi dari orang lain. Anda mulai fokus menumbuhkan kekuatannya: memberi panggung bagi anak kinestetik untuk berkreasi, memfasilitasi anak visual dengan eksplorasi visual, dan menghargai ritme anak tanpa perlu membanding-bandingkan.',
            },
            {
              id: 'mb-11',
              type: 'quote',
              content: 'Tugas orang tua bukan mencetak anak sesuai ekspektasi kita, melainkan menjadi pemandu yang membantu mereka menemukan mutiara terbaik dalam dirinya sendiri.',
              author: 'Konsultan Parenting JariBakat',
            },
            {
              id: 'mb-12',
              type: 'heading',
              content: 'Mulai Bersama JariBakat Hari Ini',
            },
            {
              id: 'mb-13',
              type: 'paragraph',
              content: 'Hentikan drama perbandingan di rumah. Temukan potensi murni buah hati Anda melalui analisis biometrik sidik jari JariBakat. Bersama kami, wujudkan rumah yang penuh rasa aman, penghargaan, dan cinta tanpa syarat.',
            },
          ]),
        },
        {
          title: 'Panduan Emas 1000 Hari Pertama: Stimulasi Sensori & Bakat Alami Bersama JariBakat',
          slug: 'panduan-emas-1000-hari-pertama-sensori-bakat',
          coverImage: '/images/banners/q62upH.png',
          category: 'Parenting & Edukasi',
          excerpt: '80% arsitektur otak manusia terbentuk sebelum usia 3 tahun. Pahami bagaimana mendeteksi gangguan sensori, mencegah speech delay, dan memetakan fitrah belajar bawaan anak sejak dini.',
          author: 'Tim Tumbuh Kembang JariBakat & Mitra Dokter Anak',
          authorRole: 'Child Development & Pediatric Specialist',
          readingTime: '6 menit baca',
          status: 'published' as const,
          contentBlocks: JSON.stringify([
            {
              id: 'hp-1',
              type: 'heading',
              content: 'Jendela Emas yang Tak Pernah Terbuka Dua Kali',
            },
            {
              id: 'hp-2',
              type: 'paragraph',
              content: 'Periode 1000 Hari Pertama Kehidupan (sejak awal masa kehamilan hingga anak berusia 2 tahun) adalah masa paling krusial dalam pembentukan manusia. Pada fase ini, otak anak membentuk lebih dari 1 juta koneksi sinapsis baru setiap detiknya. Kecepatan perkembangan ini tidak akan pernah terulang lagi di masa dewasa.',
            },
            {
              id: 'hp-3',
              type: 'paragraph',
              content: 'Banyak orang tua baru mengira bahwa stimulasi cukup dengan membelikan mainan mahal atau menonton tayangan video edukasi di layar ponsel. Padahal, otak balita membutuhkan interaksi sensori nyata: sentuhan ragam tekstur, stimulasi vestibular (keseimbangan gerak), modulasi suara manusia nyata, dan respons afektif penuh kehangatan.',
            },
            {
              id: 'hp-4',
              type: 'heading',
              content: '3 Tanda Hambatan Sensori yang Kerap Disalahartikan',
            },
            {
              id: 'hp-5',
              type: 'paragraph',
              content: 'Seringkali orang tua bingung menghadapi tingkah laku balita mereka:\n\n1. Pilih-Pilih Makanan Ekstrem (Picky Eater): Bukan anak rewel atau manja, tetapi sering kali anak mengalami hipersensitivitas tekstur oral (tactile oral defensiveness). Makanan bertekstur lembek atau kasar terasa menyiksa bagi saraf lidah mereka.\n\n2. Keterlambatan Bicara (Speech Delay): Anak yang pasif diajak bicara sering kali memiliki sistem sensori kinestetik yang butuh stimulasi gerak untuk memicu pusat bahasa di otak kiri (area Broca dan Wernicke).\n\n3. Ledakan Emosi Tanpa Sebab Jelas (Sensory Meltdown): Terjadi saat sistem saraf anak mengalami kelebihan beban sensori (sensory overload) akibat suara bising, lampu terang, atau kerumunan tanpa kemampuan menenangkan diri.',
            },
            {
              id: 'hp-6',
              type: 'quote',
              content: 'Di balik setiap perilaku anak yang tampak menantang, selalu ada kebutuhan sensori atau sistem saraf yang sedang meminta pertolongan kita untuk dipahami.',
              author: 'Tim Spesialis Tumbuh Kembang JariBakat',
            },
            {
              id: 'hp-7',
              type: 'heading',
              content: 'Integrasi Biometrik JariBakat & Skrining KPSP Klinis',
            },
            {
              id: 'hp-8',
              type: 'paragraph',
              content: 'Melalui ekosistem terpadu Allia FPA dan JariBakat, kami memadukan dua instrumen ilmiah:\n\n• Analisis Sidik Jari (Nature): Memetakan kecenderungan gaya belajar (Visual, Auditori, Kinestetik) dan sensitivitas sensori bawaan sejak lahir.\n\n• Skrining KPSP Kemenkes RI (Nurture): Memantau milestone motorik kasar, motorik halus, bicara-bahasa, serta sosialisasi kemandirian sesuai usianya.\n\nDengan perpaduan ini, orang tua tidak hanya tahu di mana posisi tumbuh kembang anak saat ini, tetapi juga tahu bagaimana cara menstimulasinya dengan teknik yang paling disukai oleh otak anak.',
            },
            {
              id: 'hp-9',
              type: 'heading',
              content: 'Beri Fondasi Terbaik Sebelum Terlambat',
            },
            {
              id: 'hp-10',
              type: 'paragraph',
              content: 'Waktu tidak dapat diputar kembali. Jangan tunggu anak masuk usia sekolah dengan membawa tumpukan masalah belajar dan emosi yang seharusnya bisa diatasi dengan mudah sejak balita.\n\nKonsultasikan tumbuh kembang dan peta bakat buah hati Anda bersama tim spesialis JariBakat hari ini. Jadikan setiap detik di masa emas mereka sebagai batu bata kokoh untuk masa depan yang cemerlang.',
            },
          ]),
        },
        {
          title: 'Mengatasi Speech Delay Sejak Dini Melalui Stimulasi Sensori & Gaya Belajar',
          slug: 'mengatasi-speech-delay-sejak-dini',
          coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
          category: 'Parenting & Edukasi',
          excerpt: 'Kenali ciri-ciri keterlambatan bicara (speech delay) pada balita dan langkah stimulasi efektif berbasis pengenalan gaya belajar alami anak.',
          author: 'Tim Analis JariBakat',
          authorRole: 'Senior Fingerprint & Parenting Consultant',
          readingTime: '5 menit baca',
          status: 'published' as const,
          contentBlocks: JSON.stringify([
            {
              id: 'b-1',
              type: 'heading',
              content: 'Memahami Ciri Keterlambatan Bicara pada Anak',
            },
            {
              id: 'b-2',
              type: 'paragraph',
              content: 'Keterlambatan bicara atau speech delay adalah salah satu kekhawatiran terbesar bagi orang tua baru. Seringkali orang tua membandingkan kemampuan bicara anaknya dengan anak lain tanpa memahami bahwa setiap anak memiliki ritme perkembangan biologis dan kecenderungan sensori yang unik.\n\nTanda-tanda awal speech delay meliputi minimnya kontak mata saat diajak berinteraksi, belum mampu meniru kata sederhana di usia 18 bulan, atau kesulitan merespons instruksi verbal sederhana dari orang tua.',
            },
            {
              id: 'b-3',
              type: 'quote',
              content: 'Deteksi dini bukan untuk memberi label, melainkan untuk memberikan stimulasi yang tepat sasaran pada periode emas tumbuh kembang anak.',
              author: 'Tim Spesialis Tumbuh Kembang JariBakat',
            },
            {
              id: 'b-4',
              type: 'heading',
              content: 'Pendekatan Stimulasi Berbasis Karakter Sensori',
            },
            {
              id: 'b-5',
              type: 'paragraph',
              content: 'Di JariBakat, kami menemukan bahwa banyak anak yang mengalami keterlambatan bicara sesungguhnya memiliki gaya belajar kinestetik atau sensori yang dominan. Ketika stimulasi hanya diberikan secara pasif melalui audio atau gawai, otak mereka kurang terstimulasi untuk memproduksi bahasa verbal aktif.',
            },
          ]),
        },
        {
          title: 'Mengenal 3 Gaya Belajar Anak: Visual, Auditori, dan Kinestetik',
          slug: 'mengenal-3-gaya-belajar-anak',
          coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
          category: 'Parenting & Edukasi',
          excerpt: 'Setiap anak menyerap informasi dengan cara yang berbeda. Pahami gaya belajar visual, auditori, dan kinestetik untuk mendampingi belajar tanpa drama.',
          author: 'Tim Edukasi JariBakat',
          authorRole: 'Learning Specialist',
          readingTime: '4 menit baca',
          status: 'published' as const,
          contentBlocks: JSON.stringify([
            {
              id: 'g-1',
              type: 'heading',
              content: 'Mengapa Anak Sulit Fokus Saat Belajar?',
            },
            {
              id: 'g-2',
              type: 'paragraph',
              content: 'Pernahkah Anda merasa lelah karena anak tampak enggan mendengarkan saat diajari pelajaran sekolah? Jangan terburu-buru menganggap anak malas. Seringkali masalahnya sederhana: cara Anda menyampaikan materi tidak cocok dengan gaya belajar alami otak mereka.',
            },
            {
              id: 'g-3',
              type: 'heading',
              content: 'Membimbing Anak Sesuai Fitrah Belajarnya',
            },
            {
              id: 'g-4',
              type: 'paragraph',
              content: 'Dengan mengenali apakah anak Anda condong ke Visual (melihat gambar), Auditori (mendengar suara), atau Kinestetik (bergerak dan mencoba langsung), Anda dapat mengubah meja belajar dari medan pertempuran menjadi ruang kreasi yang menyenangkan.',
            },
          ]),
        },
      ];

      for (const art of defaultArticles) {
        const existing = articles.find((a) => a.slug === art.slug);
        if (!existing) {
          await this.articlesService.create({
            title: art.title,
            slug: art.slug,
            coverImage: art.coverImage,
            category: art.category,
            excerpt: art.excerpt,
            author: art.author,
            authorRole: art.authorRole,
            readingTime: art.readingTime,
            status: art.status,
            contentBlocks: art.contentBlocks,
            publishedAt: new Date().toISOString(),
          });
          this.logger.log(`Seeded article: ${art.title}`);
        } else {
          await this.articlesService.update(existing.id, {
            title: art.title,
            coverImage: art.coverImage,
            category: art.category,
            excerpt: art.excerpt,
            author: art.author,
            authorRole: art.authorRole,
            readingTime: art.readingTime,
            status: art.status,
            contentBlocks: art.contentBlocks,
          });
          this.logger.log(`Updated seeded article: ${art.title}`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error seeding articles: ${err?.message || err}`);
    }
  }

  async seedUser() {
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

  async seedSiteSettings() {
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

  async seedBanners() {
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

  async seedTopics() {
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

  async seedUSPs() {
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

  async seedPrograms() {
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
          slug: 'webinar-parenting-bakat',
          title: 'Webinar Memahami Gaya Belajar & Potensi Alami Anak',
          description: 'Sesi webinar interaktif bersama Psikolog & Fingerprint Analyst membahas panduan praktis mendampingi anak belajar.',
          image: `${BUCKET_BASE}/programs/program-5.jpg`,
          category: ProgramCategory.ONLINE,
          subCategory: 'Webinar & Workshop',
          speaker: 'Tim Psikolog JariBakat',
          speakerRole: 'Child Psychologist & Talent Consultant',
          speakerImage: `${BUCKET_BASE}/speakers/speaker-1.png`,
          date: 'Jadwal Berkala',
          time: '19:30 - 21:00 WIB',
          location: 'Live Zoom Meeting',
          price: 'Gratis',
          originalPrice: 'Rp 150.000',
          badge: 'Free Event',
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

  async seedEvents() {
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

  async seedVideoCourses() {
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

  async seedCommunities() {
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

  async seedFAQs() {
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

  async seedPages() {
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

  async seedFooter() {
    const sections = await this.footerService.findAll();
    if (sections.length === 0) {
      const sec1 = await this.footerService.createSection('Kenali JariBakat', 0);
      await this.footerService.addLink(sec1.id, 'Tentang JariBakat', '/about-us', false, 0);
      await this.footerService.addLink(sec1.id, 'Paket Layanan', '/event', false, 1);
      await this.footerService.addLink(sec1.id, 'Artikel & Edukasi', '/article', false, 2);
      await this.footerService.addLink(sec1.id, 'Keunggulan Tes', '/about-us#about-story', false, 3);
      await this.footerService.addLink(sec1.id, 'FAQ', '/faq', false, 4);

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
