import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Shield,
  ShieldCheck,
  Award,
  Sparkles,
  Search,
  Bell,
  MessageSquare,
  Users,
  Image as ImageIcon,
  MapPin,
  Smile,
  Tag,
  Eye,
  Globe,
  Lock,
  Flame,
  Heart,
  Trophy,
  MoreHorizontal,
  Send,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Code2,
  Key,
  Layers,
  Palette,
  ExternalLink,
  ChevronRight,
  Pin,
  Trash2,
  Copy,
  Zap,
  Check,
  X,
  Film,
  Video,
  Link as LinkIcon,
  Play,
  Maximize2,
  ZoomIn,
  Plus
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface AttachedLink {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain?: string;
  videoId?: string;
}

interface AttachedVideo {
  url: string;
  type?: 'file' | 'youtube' | 'direct';
  title?: string;
  thumbnail?: string;
  videoId?: string;
}

const POKEMON_GIFS = [
  {
    id: 'charizard-fire',
    title: 'Charizard Flamethrower 🔥',
    category: 'Fire',
    url: 'https://media.giphy.com/media/10gMDcaONSDLfq/giphy.gif'
  },
  {
    id: 'pikachu-spark',
    title: 'Pikachu Thunderbolt ⚡',
    category: 'Electric',
    url: 'https://media.giphy.com/media/xuXzcHMkuwvf2/giphy.gif'
  },
  {
    id: 'gengar-grin',
    title: 'Gengar Shadow Hypnosis 👻',
    category: 'Ghost',
    url: 'https://media.giphy.com/media/106eZ3NhR8hAqc/giphy.gif'
  },
  {
    id: 'snorlax-yawn',
    title: 'Snorlax Pristine 10 Rest 💤',
    category: 'Normal',
    url: 'https://media.giphy.com/media/10j1n307tz008w/giphy.gif'
  },
  {
    id: 'mewtwo-power',
    title: 'Mewtwo Psychic Sphere 🔮',
    category: 'Psychic',
    url: 'https://media.giphy.com/media/W04QVzelTH2FG/giphy.gif'
  },
  {
    id: 'pack-hype',
    title: 'Hype Mailday Celebration 🎉',
    category: 'Collector',
    url: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif'
  },
  {
    id: 'gold-foil',
    title: 'Holo Foil Shimmer ✨',
    category: 'Foil',
    url: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif'
  },
  {
    id: 'squirtle-squad',
    title: 'Squirtle Squad Boss Shades 😎',
    category: 'Water',
    url: 'https://media.giphy.com/media/ardUtH5yhH5Zu/giphy.gif'
  },
  {
    id: 'eevee-happy',
    title: 'Eevee Happy Mailday Dance 🌟',
    category: 'Cute',
    url: 'https://media.giphy.com/media/11ISwbg5jUhRxq/giphy.gif'
  }
];

interface SlabAttachment {
  certNumber: string;
  cardName: string;
  setName: string;
  year: number;
  grade: number | string;
  gradeLabel: string;
  subgrades?: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  valuation?: number;
  imageUrl: string;
  tamperProofHash: string;
}

interface Post {
  guid: number;
  owner_guid: number;
  poster_name: string;
  poster_username: string;
  poster_avatar: string;
  poster_badge: string;
  description: string;
  background_style?: string;
  attached_slab?: SlabAttachment;
  attached_photos?: string[];
  attached_gif?: string;
  attached_video?: AttachedVideo;
  attached_link?: AttachedLink;
  location?: string;
  feeling?: string;
  privacy: 'public' | 'friends' | 'private';
  time_created: number;
  total_likes: number;
  last_three_reactions: string[];
  is_liked_by_user: boolean;
  total_comments: number;
  pinned?: boolean;
}

interface Comment {
  id: string;
  post_guid: number;
  owner_guid: number;
  user_name: string;
  user_avatar: string;
  user_badge: string;
  comment: string;
  time_created: number;
}

interface PokemonTheme {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  previewUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    headerBg: string;
    postBg: string;
    cardBorder: string;
    badgeBg: string;
  };
  isCustomZip?: boolean;
}

interface ComponentItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  isCore?: boolean;
}

// Preset slabs ready to attach from VCA Vault
const VAULT_PRESET_SLABS: SlabAttachment[] = [
  {
    certNumber: 'VCA-2026-88001999',
    cardName: 'Charizard - 1st Edition Shadowless Holo #4/102',
    setName: 'Base Set (1999)',
    year: 1999,
    grade: 10,
    gradeLabel: 'GEM MINT 10',
    subgrades: { centering: 10, corners: 9.5, edges: 10, surface: 10 },
    valuation: 345000,
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    tamperProofHash: 'a7f92b49c0182e6d9821'
  },
  {
    certNumber: 'VCA-2026-77002005',
    cardName: 'Rayquaza Gold Star #107/107',
    setName: 'EX Deoxys (2005)',
    year: 2005,
    grade: 9.5,
    gradeLabel: 'MINT+ 9.5',
    subgrades: { centering: 9.5, corners: 9.5, edges: 9.5, surface: 9.5 },
    valuation: 48500,
    imageUrl: 'https://images.pokemontcg.io/ex8/107_hires.png',
    tamperProofHash: 'f4820dc7190e23aa1290'
  },
  {
    certNumber: 'VCA-2026-99002021',
    cardName: 'Gengar VMAX Alternate Art Secret #271/264',
    setName: 'Fusion Strike (2021)',
    year: 2021,
    grade: 9.5,
    gradeLabel: 'GEM MINT 9.5',
    subgrades: { centering: 9.5, corners: 10, edges: 9.5, surface: 9.5 },
    valuation: 580,
    imageUrl: 'https://images.pokemontcg.io/swsh8/271_hires.png',
    tamperProofHash: 'b128ef3c9902'
  },
  {
    certNumber: 'VCA-2026-11001998',
    cardName: 'Pikachu Illustrator CoroCoro Promo',
    setName: 'CoroCoro Comics (1998)',
    year: 1998,
    grade: 10,
    gradeLabel: 'PRISTINE 10',
    subgrades: { centering: 10, corners: 10, edges: 10, surface: 10 },
    valuation: 5250000,
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&auto=format&fit=crop&q=60',
    tamperProofHash: '990f11acde43'
  }
];

const POST_GRADIENTS = [
  { id: 'none', label: 'Classic', style: '' },
  {
    id: 'charizard-flame',
    label: 'Charizard Flame',
    style: 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-bold text-lg'
  },
  {
    id: 'rayquaza-emerald',
    label: 'Rayquaza Emerald',
    style: 'bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-900 text-white font-bold text-lg'
  },
  {
    id: 'gengar-phantom',
    label: 'Gengar Shadow',
    style: 'bg-gradient-to-r from-purple-700 via-violet-900 to-slate-950 text-white font-bold text-lg'
  },
  {
    id: 'pikachu-volt',
    label: 'Pikachu Volt',
    style: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 text-slate-950 font-black text-lg'
  },
  {
    id: 'cosmic-nebula',
    label: 'Cosmic Nebula',
    style: 'bg-gradient-to-r from-fuchsia-600 via-indigo-700 to-cyan-700 text-white font-bold text-lg'
  }
];

const POKEMON_EMOJIS = ['⚡', '🔥', '💧', '🌿', '🏆', '💎', '🃏', '🛡️', '🚀', '💯', '✨', '🔴', '👑', '🎉'];

const FEELINGS_LIST = [
  'feeling hyped 🌟',
  'hunting Grails 🃏',
  'grading with VCA 🔬',
  'trading at Card Show 🤝',
  'inspecting rosettes 🔍',
  'celebrating mailday 📦',
  'seeking raw Gold Stars ✨'
];

const LOCATIONS_LIST = [
  'Pallet Town HQ',
  'VCA High-Security Vault, NY',
  'National Sports Collectors Convention',
  'Tokyo Akihabara Card District',
  'San Diego Comic-Con',
  'Cologne Card Expo Europe',
  'VCA Forensic Optical Lab'
];

export interface SlabBookAppProps {
  onBackToPortal?: () => void;
  onOpenAdminOs?: () => void;
}

export const SlabBookApp: React.FC<SlabBookAppProps> = ({ onBackToPortal, onOpenAdminOs }) => {
  let openWindow: (appId: any, initialData?: any) => void = () => {};
  try {
    const os = useOS();
    openWindow = os.openWindow;
  } catch (e) {
    // OS context might not be present if rendered outside OSProvider
  }

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'admin' | 'groups' | 'vault'>('feed');

  // Admin section navigation
  const [adminSection, setAdminSection] = useState<'dashboard' | 'themes' | 'components' | 'api' | 'settings'>('dashboard');

  // Core Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [themes, setThemes] = useState<PokemonTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<PokemonTheme | null>(null);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Post Composer State
  const [postText, setPostText] = useState<string>('');
  const [postBackground, setPostBackground] = useState<string>('');
  const [selectedSlab, setSelectedSlab] = useState<SlabAttachment | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // Media Attachment State (Images, GIFs, Videos, Links)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedGif, setSelectedGif] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<AttachedVideo | null>(null);
  const [selectedLink, setSelectedLink] = useState<AttachedLink | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Modals & Drawers
  const [isSlabPickerOpen, setIsSlabPickerOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isGifModalOpen, setIsGifModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isFeelingPickerOpen, setIsFeelingPickerOpen] = useState<boolean>(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState<boolean>(false);

  // Modal Inputs & Sub-State
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [gifSearchTerm, setGifSearchTerm] = useState<string>('');
  const [customGifUrl, setCustomGifUrl] = useState<string>('');
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [videoTitleInput, setVideoTitleInput] = useState<string>('');
  const [linkUrlInput, setLinkUrlInput] = useState<string>('');
  const [isFetchingLinkMeta, setIsFetchingLinkMeta] = useState<boolean>(false);
  const [linkFetchError, setLinkFetchError] = useState<string>('');

  // Lightbox Media Viewer State
  const [lightboxItem, setLightboxItem] = useState<{ url: string; title?: string; type: 'image' | 'video' | 'gif' } | null>(null);

  // File Input Refs
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Comments State
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(null);

  // API Sandbox Tester State
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/v1.0/wall_list_home');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [testRequestBody, setTestRequestBody] = useState<string>('{\n  "api_key_token": ""\n}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Import theme state
  const [importThemeName, setImportThemeName] = useState<string>('');
  const [importPrimaryColor, setImportPrimaryColor] = useState<string>('#3b82f6');
  const [importSecondaryColor, setImportSecondaryColor] = useState<string>('#1e293b');
  const [importDesc, setImportDesc] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Notifications & Messages data
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // 1. Initial Load from Backend OSSN Services
  const fetchSlabBookData = async () => {
    setIsLoading(true);
    try {
      // Fetch Admin Config & Themes
      const adminRes = await fetch('/api/ossn/admin/config');
      if (adminRes.ok) {
        const configData = await adminRes.json();
        setApiKey(configData.apiKey);
        setThemes(configData.themes || []);
        setActiveTheme(configData.activeTheme || configData.themes[0]);
        setComponents(configData.components || []);
        setAdminMetrics(configData.metrics);
        setSiteSettings(configData.siteSettings);
      }

      // Fetch Home Feed Posts via OSSN v1.0 API
      const feedRes = await fetch('/api/v1.0/wall_list_home');
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        if (feedData.OssnServices?.response?.posts) {
          setPosts(feedData.OssnServices.response.posts);
        }
      }

      // Fetch Notifications
      const notifRes = await fetch('/api/v1.0/notifications_list_user');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.OssnServices?.response?.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load SlabBook data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabBookData();
  }, []);

  // Media Handlers
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setIsPhotoModalOpen(false);
  };

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setSelectedPhotos(prev => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput('');
    setIsPhotoModalOpen(false);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedVideo({
          url: reader.result,
          type: 'file',
          title: file.name
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setIsVideoModalOpen(false);
  };

  const handleAttachVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;

    let videoId = '';
    let isYt = false;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      isYt = true;
      if (url.includes('youtu.be')) {
        videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
      } else {
        const params = new URLSearchParams(url.split('?')[1] || '');
        videoId = params.get('v') || '';
      }
    }

    setSelectedVideo({
      url,
      type: isYt ? 'youtube' : 'direct',
      title: videoTitleInput.trim() || (isYt ? 'Pokémon Video Showcase' : 'Collector Video'),
      videoId: videoId || undefined,
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined
    });

    setVideoUrlInput('');
    setVideoTitleInput('');
    setIsVideoModalOpen(false);
  };

  const handleFetchLinkMeta = async () => {
    const url = linkUrlInput.trim();
    if (!url) return;

    setIsFetchingLinkMeta(true);
    setLinkFetchError('');
    try {
      const res = await fetch('/api/ossn/fetch-link-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedLink(data.data);
          setLinkUrlInput('');
          setIsLinkModalOpen(false);
        } else {
          setLinkFetchError('Unable to generate rich preview for this URL.');
        }
      } else {
        setLinkFetchError('Failed to fetch link preview.');
      }
    } catch (err: any) {
      setLinkFetchError(err.message || 'Error processing link');
    } finally {
      setIsFetchingLinkMeta(false);
    }
  };

  // Drag-and-drop file upload onto Composer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDropMedia = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            if (file.type === 'image/gif') {
              setSelectedGif(reader.result);
            } else {
              setSelectedPhotos(prev => [...prev, reader.result as string]);
            }
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSelectedVideo({
              url: reader.result,
              type: 'file',
              title: file.name
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 2. Submit New Post (Rich Media Aware)
  const handleCreatePost = async () => {
    const hasPhotos = selectedPhotos.length > 0;
    const hasGif = Boolean(selectedGif);
    const hasVideo = Boolean(selectedVideo);
    const hasLink = Boolean(selectedLink);
    const hasSlab = Boolean(selectedSlab);
    const hasText = Boolean(postText.trim());

    if (!hasText && !hasSlab && !hasPhotos && !hasGif && !hasVideo && !hasLink) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/v1.0/wall_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: postText,
          background_style: postBackground || undefined,
          attached_slab: selectedSlab || undefined,
          attached_photos: hasPhotos ? selectedPhotos : undefined,
          attached_gif: hasGif ? selectedGif : undefined,
          attached_video: hasVideo ? selectedVideo : undefined,
          attached_link: hasLink ? selectedLink : undefined,
          location: selectedLocation || undefined,
          feeling: selectedFeeling || undefined,
          privacy: postPrivacy,
          poster_guid: 1
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.OssnServices?.response?.post) {
          setPosts(prev => [result.OssnServices.response.post, ...prev]);
          // Reset form
          setPostText('');
          setPostBackground('');
          setSelectedSlab(null);
          setSelectedPhotos([]);
          setSelectedGif('');
          setSelectedVideo(null);
          setSelectedLink(null);
          setSelectedLocation('');
          setSelectedFeeling('');
          setIsBgPickerOpen(false);
        }
      }
    } catch (err) {
      console.error('Failed to submit post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // 3. React / Like Post
  const handleReaction = async (postGuid: number, reaction: string = 'like') => {
    try {
      const res = await fetch('/api/v1.0/like_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_guid: postGuid, reaction })
      });

      if (res.ok) {
        const data = await res.json();
        const resp = data.OssnServices?.response;
        setPosts(prev =>
          prev.map(p => {
            if (p.guid === postGuid) {
              return {
                ...p,
                is_liked_by_user: resp.is_liked,
                total_likes: resp.total_likes,
                last_three_reactions: resp.last_three_reactions
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  // 4. Toggle & Fetch Comments
  const handleToggleComments = async (postGuid: number) => {
    if (openCommentsPostId === postGuid) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(postGuid);
    if (!commentsMap[postGuid]) {
      try {
        const res = await fetch(`/api/v1.0/comments_list?post_guid=${postGuid}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap(prev => ({
            ...prev,
            [postGuid]: data.OssnServices?.response?.comments || []
          }));
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  // 5. Submit Comment
  const handleAddComment = async (postGuid: number) => {
    const text = newCommentText[postGuid]?.trim();
    if (!text) return;

    try {
      const res = await fetch('/api/v1.0/comment_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_guid: postGuid, comment: text, user_guid: 1 })
      });

      if (res.ok) {
        const data = await res.json();
        const newC = data.OssnServices?.response?.comment;
        if (newC) {
          setCommentsMap(prev => ({
            ...prev,
            [postGuid]: [...(prev[postGuid] || []), newC]
          }));
          setPosts(prev =>
            prev.map(p => (p.guid === postGuid ? { ...p, total_comments: p.total_comments + 1 } : p))
          );
          setNewCommentText(prev => ({ ...prev, [postGuid]: '' }));
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  // 6. Delete Post
  const handleDeletePost = async (postGuid: number) => {
    if (!confirm('Are you sure you want to delete this post from SlabBook?')) return;
    try {
      const res = await fetch('/api/v1.0/wall_delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_guid: postGuid })
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.guid !== postGuid));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 7. Admin: Switch Theme
  const handleSwitchTheme = async (themeId: string) => {
    try {
      const res = await fetch('/api/ossn/admin/set-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTheme(data.activeTheme);
      }
    } catch (err) {
      console.error('Failed to switch theme:', err);
    }
  };

  // 8. Admin: Download Theme ZIP
  const handleDownloadThemeZip = (themeId: string) => {
    window.location.href = `/api/ossn/admin/download-theme-zip/${themeId}`;
  };

  // 9. Admin: Generate new API Key
  const handleGenerateApiKey = async () => {
    try {
      const res = await fetch('/api/ossn/admin/genkey', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error('Failed to generate key:', err);
    }
  };

  // 10. Admin: Toggle Component
  const handleToggleComponent = async (componentId: string) => {
    try {
      const res = await fetch('/api/ossn/admin/toggle-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId })
      });
      if (res.ok) {
        const data = await res.json();
        setComponents(prev =>
          prev.map(c => (c.id === componentId ? { ...c, isActive: data.component.isActive } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle component:', err);
    }
  };

  // 11. Run Live API Test
  const handleExecuteApiTest = async () => {
    setIsTestingApi(true);
    setTestResult(null);
    const start = performance.now();
    try {
      let url = testEndpoint;
      let options: RequestInit = {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      };

      if (testMethod === 'POST') {
        let bodyParsed = {};
        try {
          bodyParsed = JSON.parse(testRequestBody);
        } catch (e) {
          bodyParsed = {};
        }
        options.body = JSON.stringify({ ...bodyParsed, api_key_token: apiKey });
      } else {
        if (!url.includes('?')) {
          url += `?api_key=${apiKey}`;
        } else {
          url += `&api_key=${apiKey}`;
        }
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const elapsed = (performance.now() - start).toFixed(1);
      setTestResult({
        status: res.status,
        latencyMs: elapsed,
        data
      });
    } catch (err: any) {
      setTestResult({
        status: 500,
        error: err.message
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // 12. Import Custom Theme
  const handleImportCustomTheme = async () => {
    if (!importThemeName) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/ossn/admin/import-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: importThemeName,
          primaryColor: importPrimaryColor,
          secondaryColor: importSecondaryColor,
          description: importDesc || 'Custom imported Pokémon theme'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setThemes(prev => [...prev, data.theme]);
        setActiveTheme(data.theme);
        setImportThemeName('');
        alert(`Theme "${data.theme.name}" successfully imported and activated!`);
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // Copy API key to clipboard
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Open VCA Lab directly to inspect card
  const handleInspectInVca = (certNumber: string) => {
    openWindow('vca', { certNumber, tab: 'cert' });
  };

  // Primary color helper
  const themePrimary = activeTheme?.colors?.primary || '#ef4444';
  const themeHeaderBg = activeTheme?.colors?.headerBg || 'linear-gradient(135deg, #b91c1c 0%, #1e1b4b 100%)';

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (OSSN BRANDED WITH POKÉMON THEME DYNAMICS) */}
      {/* ========================================================================= */}
      <header
        style={{ background: themeHeaderBg, borderBottom: `2px solid ${themePrimary}` }}
        className="px-4 py-2.5 flex items-center justify-between shadow-xl z-20 shrink-0 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          {/* OSSN Logo + SlabBook Name */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/20 p-1 flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white drop-shadow">SLABBOOK</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-bold uppercase tracking-wider text-white">
                  OSSN v6.4
                </span>
              </div>
              <p className="text-[10px] text-white/80 leading-none">
                {activeTheme ? activeTheme.name : 'Pokémon Collector Network'}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-black/30 border border-white/20 rounded-full px-3 py-1.5 w-64 ml-4 focus-within:border-white/60 focus-within:w-72 transition-all">
            <Search className="w-4 h-4 text-white/60 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search cards, slabs, collectors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-white/50 outline-none w-full"
            />
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 gap-1">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'feed' ? 'bg-white text-slate-950 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'admin' ? 'bg-white text-slate-950 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'vault' ? 'bg-white text-slate-950 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Vault Slabs</span>
          </button>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/20 text-xs text-white font-medium transition cursor-pointer"
            title="Switch Pokémon Theme or Export ZIP"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Notifications Globe */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/20 text-white relative transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.viewed) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center text-white ring-2 ring-slate-950">
                  {notifications.filter(n => !n.viewed).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Notifications</span>
                  <button
                    onClick={async () => {
                      await fetch('/api/v2.0/notification/mark_all_read', { method: 'POST' });
                      setNotifications(prev => prev.map(n => ({ ...n, viewed: true })));
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-2.5 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs">
                      <img src={n.actor_avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div>
                        <p className="text-slate-200">
                          <strong className="text-white">{n.actor_name}</strong> {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages Icon */}
          <button
            onClick={() => setIsMessagesOpen(!isMessagesOpen)}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/20 text-white relative transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold flex items-center justify-center text-white ring-2 ring-slate-950">
              2
            </span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-8 h-8 rounded-full border border-white/40 object-cover"
            />
            <div className="hidden lg:block text-left leading-none">
              <span className="text-xs font-bold text-white block">VCA Lead</span>
              <span className="text-[9px] text-amber-300 font-semibold uppercase">Administrator</span>
            </div>
          </div>

          {/* External Navigation Back to Portal / OS Desktop */}
          {(onBackToPortal || onOpenAdminOs) && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
              {onBackToPortal && (
                <button
                  id="slabbook-back-to-portal-btn"
                  onClick={onBackToPortal}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1"
                  title="Return to User Vault & Portfolio"
                >
                  <span>User Portal</span>
                </button>
              )}
              {onOpenAdminOs && (
                <button
                  id="slabbook-open-admin-os-btn"
                  onClick={onOpenAdminOs}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1"
                  title="Open VCA Admin OS Desktop"
                >
                  <span>Admin OS</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===================================================================== */}
        {/* VIEW A: SOCIAL WALL / NEWSFEED (SCREENSHOT 1 IMPLEMENTATION) */}
        {/* ===================================================================== */}
        {activeTab === 'feed' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Groups & Navigation Shortcuts */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 hidden md:flex flex-col gap-4 overflow-y-auto shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Explorer</span>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Main Collector Wall</span>
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 text-xs font-medium transition"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>VCA Certified Slabs</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 text-xs font-medium transition"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>OSSN Admin Panel</span>
                </button>
              </div>

              {/* Active Pokémon Theme Mini Card */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Theme</span>
                  <span
                    style={{ backgroundColor: themePrimary }}
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate">{activeTheme?.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{activeTheme?.description}</p>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => setIsThemeModalOpen(true)}
                    className="flex-1 py-1 px-2 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 text-center transition"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => activeTheme && handleDownloadThemeZip(activeTheme.id)}
                    className="flex-1 py-1 px-2 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 transition"
                    title="Export as OSSN Theme ZIP"
                  >
                    <Download className="w-3 h-3" />
                    ZIP
                  </button>
                </div>
              </div>

              {/* Collector Guilds / Groups */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Collector Guilds</span>
                  <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline">See all</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 cursor-pointer transition">
                    <div className="w-7 h-7 rounded-md bg-red-950/80 border border-red-500/40 flex items-center justify-center text-xs">
                      🔥
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">Vintage WOTC Grails</p>
                      <p className="text-[10px] text-slate-400">1,420 members</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 cursor-pointer transition">
                    <div className="w-7 h-7 rounded-md bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-xs">
                      👑
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">VCA Gem Mint 10 Club</p>
                      <p className="text-[10px] text-slate-400">850 members</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 cursor-pointer transition">
                    <div className="w-7 h-7 rounded-md bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-xs">
                      🐉
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">Rayquaza & High-End Ex</p>
                      <p className="text-[10px] text-slate-400">2,190 members</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Central Feed Stream */}
            <main className="flex-1 overflow-y-auto px-4 py-5 max-w-3xl mx-auto w-full space-y-5">
              {/* Site Announcement Banner */}
              {siteSettings?.systemAnnouncement && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/80 via-purple-950/60 to-slate-900 border border-red-500/40 shadow-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>{siteSettings.systemAnnouncement}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase">
                    Official
                  </span>
                </div>
              )}

              {/* =============================================================== */}
              {/* ADVANCED POST BOX (MATCHING SCREENSHOT 1 "📢 Post") */}
              {/* =============================================================== */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropMedia}
                className={`bg-slate-900/90 border rounded-2xl shadow-xl p-4 space-y-3 relative transition-all ${
                  isDraggingOver ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/50' : 'border-slate-800'
                }`}
              >
                {/* Drag and Drop Active Overlay */}
                {isDraggingOver && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm border-2 border-dashed border-cyan-400 rounded-2xl z-30 flex flex-col items-center justify-center pointer-events-none text-cyan-300">
                    <Upload className="w-10 h-10 animate-bounce mb-2 text-cyan-400" />
                    <p className="font-bold text-sm">Drop your photo, GIF, or video here!</p>
                    <p className="text-xs text-slate-400 mt-1">Files will automatically attach to your post</p>
                  </div>
                )}

                {/* Hidden File Inputs for Native Uploads */}
                <input
                  ref={photoFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📢</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Post to SlabBook</span>
                  </div>
                  {postBackground && (
                    <button
                      onClick={() => setPostBackground('')}
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Reset Background
                    </button>
                  )}
                </div>

                {/* Textarea with Background formatting */}
                <div className="flex gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-700"
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className={`rounded-xl transition-all ${
                        postBackground
                          ? `${postBackground} p-6 text-center min-h-[140px] flex items-center justify-center shadow-inner`
                          : 'bg-slate-950/60 border border-slate-800 p-3 min-h-[80px]'
                      }`}
                    >
                      <textarea
                        value={postText}
                        onChange={e => setPostText(e.target.value)}
                        placeholder="What's on your mind? Share a slab, grail, mailday, photo, or clip..."
                        rows={postBackground ? 3 : 2}
                        className={`w-full bg-transparent outline-none resize-none text-sm placeholder:text-slate-500 ${
                          postBackground ? 'text-white placeholder:text-white/70 text-center font-bold text-lg' : 'text-slate-100'
                        }`}
                      />
                    </div>

                    {/* Meta tags: Location & Feeling */}
                    {(selectedLocation || selectedFeeling) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        {selectedLocation && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {selectedLocation}
                            <button onClick={() => setSelectedLocation('')} className="hover:text-white">
                              ×
                            </button>
                          </span>
                        )}
                        {selectedFeeling && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                            <Smile className="w-3 h-3" /> {selectedFeeling}
                            <button onClick={() => setSelectedFeeling('')} className="hover:text-white">
                              ×
                            </button>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Attached VCA Slab Preview */}
                    {selectedSlab && (
                      <div className="p-3 rounded-xl bg-slate-950 border-2 border-amber-500/60 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedSlab.imageUrl}
                            alt={selectedSlab.cardName}
                            className="w-12 h-16 object-contain rounded border border-amber-500/40 bg-black/40"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                                {selectedSlab.gradeLabel}
                              </span>
                              <span className="text-xs font-bold text-slate-200 truncate">{selectedSlab.cardName}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Cert: {selectedSlab.certNumber} • {selectedSlab.setName}
                            </p>
                            {selectedSlab.valuation && (
                              <p className="text-[11px] font-bold text-emerald-400">
                                Est. Market Value: ${selectedSlab.valuation.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSlab(null)}
                          className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Attached Photos Gallery Preview */}
                    {selectedPhotos.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Attached Photos ({selectedPhotos.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPhotos([])}
                            className="text-[11px] text-red-400 hover:underline"
                          >
                            Remove all
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {selectedPhotos.map((photo, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-video bg-black/60">
                              <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-red-400 hover:text-white transition"
                                title="Remove Photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="border border-dashed border-slate-700 hover:border-cyan-400 rounded-lg aspect-video flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300 transition bg-slate-900/40"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[10px] font-semibold">Add More</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Attached GIF Preview */}
                    {selectedGif && (
                      <div className="relative rounded-xl overflow-hidden border border-purple-500/50 bg-black/60 max-h-56 flex items-center justify-center">
                        <img src={selectedGif} alt="Attached GIF" className="max-h-56 object-contain" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                          GIF
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedGif('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-red-400 hover:text-white transition"
                          title="Remove GIF"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Attached Video Preview */}
                    {selectedVideo && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-red-500/50 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded bg-black/85 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {selectedVideo.thumbnail ? (
                              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
                            ) : (
                              <Video className="w-5 h-5 text-red-400" />
                            )}
                            <Play className="w-3.5 h-3.5 text-white absolute drop-shadow" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold text-[10px] uppercase border border-red-500/40">
                                {selectedVideo.type === 'youtube' ? 'YouTube' : 'Video'}
                              </span>
                              <span className="text-xs font-bold text-slate-200 truncate">{selectedVideo.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-sm">{selectedVideo.url}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(null)}
                          className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Attached Link Preview */}
                    {selectedLink && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/50 flex items-start justify-between gap-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          {selectedLink.image && (
                            <img
                              src={selectedLink.image}
                              alt={selectedLink.title}
                              className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-black/40"
                            />
                          )}
                          <div className="space-y-0.5 truncate">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block truncate">
                              {selectedLink.domain}
                            </span>
                            <h5 className="text-xs font-bold text-white truncate max-w-md">{selectedLink.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{selectedLink.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLink(null)}
                          className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toolbar Buttons Row */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Attach VCA Slab Button */}
                    <button
                      type="button"
                      onClick={() => setIsSlabPickerOpen(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedSlab
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Attach Certified VCA Slab"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Attach Slab</span>
                    </button>

                    {/* Attach Photo Button */}
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedPhotos.length > 0
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Attach Images or Upload from Device"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Photo</span>
                      {selectedPhotos.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                          {selectedPhotos.length}
                        </span>
                      )}
                    </button>

                    {/* Attach GIF Button */}
                    <button
                      type="button"
                      onClick={() => setIsGifModalOpen(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedGif
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Attach Pokémon or Collector GIF"
                    >
                      <Film className="w-4 h-4 text-purple-400" />
                      <span className="hidden sm:inline">GIF</span>
                    </button>

                    {/* Attach Video Button */}
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedVideo
                          ? 'bg-red-500/20 border-red-500/60 text-red-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Attach Video or YouTube Showcase"
                    >
                      <Video className="w-4 h-4 text-red-400" />
                      <span className="hidden sm:inline">Video</span>
                    </button>

                    {/* Attach Link Button */}
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        selectedLink
                          ? 'bg-blue-500/20 border-blue-500/60 text-blue-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Share Card Link, Price Guide or News"
                    >
                      <LinkIcon className="w-4 h-4 text-blue-400" />
                      <span className="hidden sm:inline">Link</span>
                    </button>

                    {/* Gradient Background Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          postBackground
                            ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Post Background Styling"
                      >
                        <Palette className="w-4 h-4 text-purple-400" />
                        <span className="hidden md:inline">Style</span>
                      </button>

                      {isBgPickerOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Choose Gradient</span>
                          {POST_GRADIENTS.map(bg => (
                            <button
                              key={bg.id}
                              onClick={() => {
                                setPostBackground(bg.style);
                                setIsBgPickerOpen(false);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                            >
                              <span>{bg.label}</span>
                              {postBackground === bg.style && <Check className="w-3 h-3 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsLocationPickerOpen(!isLocationPickerOpen)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          selectedLocation
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Add Location / Expo"
                      >
                        <MapPin className="w-4 h-4 text-cyan-400" />
                      </button>

                      {isLocationPickerOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Popular Card Spots</span>
                          {LOCATIONS_LIST.map(loc => (
                            <button
                              key={loc}
                              onClick={() => {
                                setSelectedLocation(loc);
                                setIsLocationPickerOpen(false);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-slate-800 text-slate-200"
                            >
                              📍 {loc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Feeling Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsFeelingPickerOpen(!isFeelingPickerOpen)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          selectedFeeling
                            ? 'bg-pink-500/20 border-pink-500/60 text-pink-300'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Add Feeling / Activity"
                      >
                        <Smile className="w-4 h-4 text-pink-400" />
                      </button>

                      {isFeelingPickerOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Collector Feelings</span>
                          {FEELINGS_LIST.map(feel => (
                            <button
                              key={feel}
                              onClick={() => {
                                setSelectedFeeling(feel);
                                setIsFeelingPickerOpen(false);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-slate-800 text-slate-200"
                            >
                              {feel}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Emojis Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 transition cursor-pointer"
                        title="Add Pokémon Emojis"
                      >
                        <span className="text-xs">⚡</span>
                      </button>

                      {isEmojiPickerOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 grid grid-cols-4 gap-1">
                          {POKEMON_EMOJIS.map(em => (
                            <button
                              key={em}
                              onClick={() => {
                                setPostText(prev => prev + ' ' + em);
                                setIsEmojiPickerOpen(false);
                              }}
                              className="p-2 text-center text-lg hover:bg-slate-800 rounded"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Privacy & Post Button */}
                  <div className="flex items-center gap-2">
                    <select
                      value={postPrivacy}
                      onChange={e => setPostPrivacy(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="public">🌐 Public</option>
                      <option value="friends">👥 Friends</option>
                      <option value="private">🔒 Only Me</option>
                    </select>

                    <button
                      onClick={handleCreatePost}
                      disabled={
                        isSubmittingPost ||
                        (!postText.trim() &&
                          !selectedSlab &&
                          selectedPhotos.length === 0 &&
                          !selectedGif &&
                          !selectedVideo &&
                          !selectedLink)
                      }
                      style={{ backgroundColor: themePrimary }}
                      className="px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmittingPost ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* =============================================================== */}
              {/* FEED POSTS STREAM */}
              {/* =============================================================== */}
              <div className="space-y-4">
                {posts.map(post => (
                  <article
                    key={post.guid}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.poster_avatar}
                          alt={post.poster_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                              {post.poster_name}
                            </span>
                            {post.poster_badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                {post.poster_badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>
                              {Math.round((Date.now() - post.time_created) / (3600 * 1000))} hours ago
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {post.privacy === 'public' ? (
                                <Globe className="w-3 h-3 text-slate-500" />
                              ) : (
                                <Users className="w-3 h-3 text-slate-500" />
                              )}
                              <span className="capitalize">{post.privacy}</span>
                            </span>
                            {post.location && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-400 flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" /> {post.location}
                                </span>
                              </>
                            )}
                            {post.feeling && (
                              <>
                                <span>•</span>
                                <span className="text-purple-400">{post.feeling}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="flex items-center gap-1">
                        {post.pinned && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.guid)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                      {post.background_style ? (
                        <div
                          className={`p-6 rounded-xl ${post.background_style} text-center shadow-inner my-2`}
                        >
                          <p className="text-lg font-bold drop-shadow-md">{post.description}</p>
                        </div>
                      ) : (
                        post.description && (
                          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                            {post.description}
                          </p>
                        )
                      )}
                    </div>

                    {/* Attached Photos Gallery */}
                    {post.attached_photos && post.attached_photos.length > 0 && (
                      <div className="px-4 pb-3">
                        <div
                          className={`grid gap-2 rounded-xl overflow-hidden ${
                            post.attached_photos.length === 1
                              ? 'grid-cols-1 max-h-[460px]'
                              : post.attached_photos.length === 2
                              ? 'grid-cols-2 max-h-[380px]'
                              : post.attached_photos.length === 3
                              ? 'grid-cols-3 max-h-[320px]'
                              : 'grid-cols-2 sm:grid-cols-4 max-h-[280px]'
                          }`}
                        >
                          {post.attached_photos.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxItem({ url: imgUrl, title: `${post.poster_name}'s Photo`, type: 'image' })}
                              className="relative group cursor-pointer overflow-hidden rounded-lg bg-black/60 border border-slate-800 aspect-video hover:border-cyan-400 transition"
                            >
                              <img
                                src={imgUrl}
                                alt="Post media"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                              <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/75 text-white opacity-0 group-hover:opacity-100 transition shadow">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attached Animated GIF */}
                    {post.attached_gif && (
                      <div className="px-4 pb-3">
                        <div
                          onClick={() => setLightboxItem({ url: post.attached_gif!, title: 'Animated GIF', type: 'gif' })}
                          className="relative group cursor-pointer rounded-xl overflow-hidden border border-purple-500/40 bg-black/60 max-h-96 flex items-center justify-center hover:border-purple-400 transition shadow-lg"
                        >
                          <img
                            src={post.attached_gif}
                            alt="Post GIF"
                            className="max-h-96 object-contain w-auto rounded-lg"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 text-purple-300 text-[10px] font-black border border-purple-500/50 shadow">
                            GIF
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/75 text-white opacity-0 group-hover:opacity-100 transition shadow">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attached Video */}
                    {post.attached_video && (
                      <div className="px-4 pb-3">
                        <div className="rounded-xl overflow-hidden border border-red-500/40 bg-slate-950 shadow-lg">
                          {post.attached_video.type === 'youtube' && post.attached_video.videoId ? (
                            <div className="relative aspect-video w-full bg-black">
                              <iframe
                                src={`https://www.youtube.com/embed/${post.attached_video.videoId}`}
                                title={post.attached_video.title || 'YouTube Video'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                              />
                            </div>
                          ) : (
                            <div className="relative bg-black flex items-center justify-center">
                              <video
                                src={post.attached_video.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full max-h-[440px] object-contain mx-auto"
                              />
                            </div>
                          )}
                          {post.attached_video.title && (
                            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200 truncate">{post.attached_video.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase">
                                {post.attached_video.type === 'youtube' ? 'YouTube' : 'Video'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Attached Link Card */}
                    {post.attached_link && (
                      <div className="px-4 pb-3">
                        <a
                          href={post.attached_link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-950/80 overflow-hidden transition group shadow-md"
                        >
                          {post.attached_link.image && (
                            <div className="h-44 w-full overflow-hidden bg-black/50 relative">
                              <img
                                src={post.attached_link.image}
                                alt={post.attached_link.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                                {post.attached_link.domain}
                              </div>
                            </div>
                          )}
                          <div className="p-3 space-y-1">
                            {!post.attached_link.image && (
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                                {post.attached_link.domain}
                              </span>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                                {post.attached_link.title}
                              </h5>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                            </div>
                            {post.attached_link.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {post.attached_link.description}
                              </p>
                            )}
                          </div>
                        </a>
                      </div>
                    )}

                    {/* Attached VCA Slab 3D Interactive Showcase */}
                    {post.attached_slab && (
                      <div className="px-4 pb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-cyan-500/40 shadow-2xl relative group overflow-hidden">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Card Image with Holographic Shine border */}
                            <div className="relative shrink-0">
                              <img
                                src={post.attached_slab.imageUrl}
                                alt={post.attached_slab.cardName}
                                className="w-28 h-40 object-contain rounded-lg shadow-2xl border border-white/20 bg-black/60 group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-amber-400/80 text-amber-300 font-black text-[10px] shadow">
                                {post.attached_slab.gradeLabel}
                              </div>
                            </div>

                            {/* Card Specifications & Subgrades */}
                            <div className="flex-1 space-y-2 text-left w-full">
                              <div>
                                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block">
                                  VCA VERIFIED CERTIFICATION
                                </span>
                                <h4 className="text-sm font-black text-white">{post.attached_slab.cardName}</h4>
                                <p className="text-xs text-slate-400">
                                  {post.attached_slab.setName} • Cert #{post.attached_slab.certNumber}
                                </p>
                              </div>

                              {/* Subgrades Pills */}
                              {post.attached_slab.subgrades && (
                                <div className="grid grid-cols-4 gap-1 text-center">
                                  <div className="p-1 rounded bg-slate-800/80 border border-slate-700">
                                    <span className="text-[9px] text-slate-400 block">Centering</span>
                                    <span className="text-xs font-black text-cyan-400">
                                      {post.attached_slab.subgrades.centering}
                                    </span>
                                  </div>
                                  <div className="p-1 rounded bg-slate-800/80 border border-slate-700">
                                    <span className="text-[9px] text-slate-400 block">Corners</span>
                                    <span className="text-xs font-black text-cyan-400">
                                      {post.attached_slab.subgrades.corners}
                                    </span>
                                  </div>
                                  <div className="p-1 rounded bg-slate-800/80 border border-slate-700">
                                    <span className="text-[9px] text-slate-400 block">Edges</span>
                                    <span className="text-xs font-black text-cyan-400">
                                      {post.attached_slab.subgrades.edges}
                                    </span>
                                  </div>
                                  <div className="p-1 rounded bg-slate-800/80 border border-slate-700">
                                    <span className="text-[9px] text-slate-400 block">Surface</span>
                                    <span className="text-xs font-black text-cyan-400">
                                      {post.attached_slab.subgrades.surface}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Market Valuation & Tamper-Proof Hash */}
                              <div className="flex items-center justify-between pt-1 text-xs">
                                {post.attached_slab.valuation && (
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Valuation</span>
                                    <span className="font-bold text-emerald-400">
                                      ${post.attached_slab.valuation.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                                <button
                                  onClick={() => handleInspectInVca(post.attached_slab!.certNumber)}
                                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Inspect in VCA Lab</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Like Count & Comments Count Status Bar */}
                    <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">🔥</span>
                        <span className="text-sm">🏆</span>
                        <span className="font-semibold text-slate-300 ml-1">{post.total_likes} reactions</span>
                      </div>
                      <div
                        onClick={() => handleToggleComments(post.guid)}
                        className="cursor-pointer hover:underline"
                      >
                        {post.total_comments} comments
                      </div>
                    </div>

                    {/* Actions Bar (Like, Comment, Share) */}
                    <div className="px-4 py-1.5 border-t border-slate-800 flex items-center justify-around text-xs font-semibold text-slate-400">
                      <button
                        onClick={() => handleReaction(post.guid, 'fire')}
                        className={`flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer ${
                          post.is_liked_by_user ? 'text-orange-400 font-bold' : 'hover:text-white'
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                        <span>{post.is_liked_by_user ? 'Hyped 🔥' : 'Fire'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.guid)}
                        className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://slabbook.vca/post/${post.guid}`);
                          alert('Post link copied to clipboard!');
                        }}
                        className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comments Thread Section */}
                    {openCommentsPostId === post.guid && (
                      <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-3">
                        {/* New Comment Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment or offer on this slab..."
                            value={newCommentText[post.guid] || ''}
                            onChange={e =>
                              setNewCommentText(prev => ({ ...prev, [post.guid]: e.target.value }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddComment(post.guid);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                          />
                          <button
                            onClick={() => handleAddComment(post.guid)}
                            style={{ backgroundColor: themePrimary }}
                            className="px-3 py-2 rounded-xl text-white text-xs font-bold shadow hover:brightness-110 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Existing Comments */}
                        <div className="space-y-2 pt-1">
                          {(commentsMap[post.guid] || []).map(comm => (
                            <div key={comm.id} className="flex gap-2.5 p-2 rounded-xl bg-slate-900/60 text-xs">
                              <img
                                src={comm.user_avatar}
                                alt={comm.user_name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white">{comm.user_name}</span>
                                  {comm.user_badge && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                                      {comm.user_badge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500">1h ago</span>
                                </div>
                                <p className="text-slate-300 mt-0.5 leading-relaxed">{comm.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </main>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW B: OSSN ADMINISTRATOR DASHBOARD (SCREENSHOT 2 IMPLEMENTATION) */}
        {/* ===================================================================== */}
        {activeTab === 'admin' && (
          <div className="flex-1 flex overflow-hidden">
            {/* OSSN Admin Sidebar (Matching Screenshot 2) */}
            <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col justify-between shrink-0">
              <div className="p-4 space-y-4">
                {/* OSSN 4-Color Bars Logo */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="flex gap-1 h-7">
                    <div className="w-1.5 h-full rounded-sm bg-blue-500" />
                    <div className="w-1.5 h-full rounded-sm bg-red-500" />
                    <div className="w-1.5 h-full rounded-sm bg-yellow-400" />
                    <div className="w-1.5 h-full rounded-sm bg-green-500" />
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-tight text-white block">OSSN ADMIN</span>
                    <span className="text-[10px] text-slate-400">Social Network Core</span>
                  </div>
                </div>

                {/* Sidebar Navigation Items */}
                <nav className="space-y-1">
                  <button
                    onClick={() => setAdminSection('dashboard')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      adminSection === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setAdminSection('themes')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      adminSection === 'themes'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Pokémon Themes (ZIP)</span>
                  </button>

                  <button
                    onClick={() => setAdminSection('components')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      adminSection === 'components'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Components Manager</span>
                  </button>

                  <button
                    onClick={() => setAdminSection('api')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      adminSection === 'api'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>Web Services (API)</span>
                  </button>

                  <button
                    onClick={() => setAdminSection('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      adminSection === 'settings'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Configure Subsystems</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Quick Action: Switch to Feed */}
              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('feed')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>View Social Network</span>
                </button>
              </div>
            </aside>

            {/* Admin Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SUBSECTION 1: DASHBOARD METRICS */}
              {adminSection === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">OSSN Administrator Dashboard</h2>
                    <p className="text-xs text-slate-400">
                      Live runtime monitor for Open Source Social Network (OSSN v6.4.0-VCA).
                    </p>
                  </div>

                  {/* Metrics KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">Active Users</span>
                      <span className="text-2xl font-black text-white mt-1 block">
                        {adminMetrics?.totalUsers || 4}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">● 100% verified graders</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">Wall Posts</span>
                      <span className="text-2xl font-black text-cyan-400 mt-1 block">
                        {adminMetrics?.totalPosts || posts.length}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-semibold">
                        {adminMetrics?.totalSlabsShared || 3} slabs attached
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">API Calls Handled</span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block">
                        {adminMetrics?.totalApiRequests || 148}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">OssnServices active</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">Active Theme</span>
                      <span className="text-lg font-bold text-red-400 mt-1 block truncate">
                        {activeTheme?.name || 'Kanto PokéBall'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">v{activeTheme?.version}</span>
                    </div>
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white">Administrator Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setAdminSection('themes')}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
                      >
                        <Palette className="w-5 h-5 text-purple-400 mb-2" />
                        <span className="text-xs font-bold text-white block">Switch Pokémon Theme</span>
                        <span className="text-[11px] text-slate-400">Kanto, Rayquaza, Charizard & ZIP export</span>
                      </button>

                      <button
                        onClick={() => setAdminSection('components')}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
                      >
                        <Layers className="w-5 h-5 text-emerald-400 mb-2" />
                        <span className="text-xs font-bold text-white block">Manage Components</span>
                        <span className="text-[11px] text-slate-400">Enable/disable OssnWall, Chat & Slabs</span>
                      </button>

                      <button
                        onClick={() => setAdminSection('api')}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
                      >
                        <Code2 className="w-5 h-5 text-cyan-400 mb-2" />
                        <span className="text-xs font-bold text-white block">Test API Endpoints</span>
                        <span className="text-[11px] text-slate-400">Sandbox for v1.0 and v2.0 calls</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSECTION 2: POKÉMON THEMES & ZIP MANAGER */}
              {adminSection === 'themes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">Pokémon Themes & ZIP Studio</h2>
                      <p className="text-xs text-slate-400">
                        Custom designed themes for collectors. Each theme can be exported as a standard OSSN theme ZIP archive!
                      </p>
                    </div>
                    <button
                      onClick={() => setIsThemeModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Theme ZIP</span>
                    </button>
                  </div>

                  {/* Themes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map(t => (
                      <div
                        key={t.id}
                        className={`rounded-2xl border overflow-hidden bg-slate-900/90 shadow-xl transition-all ${
                          activeTheme?.id === t.id ? 'border-cyan-400 ring-2 ring-cyan-500/40' : 'border-slate-800'
                        }`}
                      >
                        {/* Preview Banner */}
                        <div
                          style={{ background: t.colors.headerBg }}
                          className="h-24 p-3 flex flex-col justify-between relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-black/50 text-white font-bold uppercase">
                              v{t.version}
                            </span>
                            {activeTheme?.id === t.id && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black uppercase flex items-center gap-1">
                                <Check className="w-3 h-3" /> ACTIVE
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-white drop-shadow truncate">{t.name}</h4>
                        </div>

                        {/* Description & Color Swatches */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-slate-300 line-clamp-2">{t.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Palette:</span>
                            <span
                              style={{ backgroundColor: t.colors.primary }}
                              className="w-4 h-4 rounded-full ring-1 ring-white/20"
                            />
                            <span
                              style={{ backgroundColor: t.colors.secondary }}
                              className="w-4 h-4 rounded-full ring-1 ring-white/20"
                            />
                            <span
                              style={{ backgroundColor: t.colors.accent }}
                              className="w-4 h-4 rounded-full ring-1 ring-white/20"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-slate-800">
                            {activeTheme?.id !== t.id && (
                              <button
                                onClick={() => handleSwitchTheme(t.id)}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadThemeZip(t.id)}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                              title="Download full OSSN theme .zip package"
                            >
                              <Download className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Export ZIP</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBSECTION 3: COMPONENTS MANAGER */}
              {adminSection === 'components' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">OSSN Components Manager</h2>
                    <p className="text-xs text-slate-400">
                      Enable or disable modular extensions for the social network.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-800 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    {components.map(comp => (
                      <div key={comp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{comp.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              v{comp.version}
                            </span>
                            {comp.isCore && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                                Core
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{comp.description}</p>
                          <span className="text-[10px] text-slate-500">By {comp.author}</span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleToggleComponent(comp.id)}
                          disabled={comp.isCore}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            comp.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                          } ${comp.isCore ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              comp.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBSECTION 4: WEB SERVICES API & SANDBOX TESTER */}
              {adminSection === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">OSSN Web Services (API) Manager</h2>
                    <p className="text-xs text-slate-400">
                      Configure REST endpoints, manage your authentication key, and test API methods in real time.
                    </p>
                  </div>

                  {/* API Key Box */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active API Key</span>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex-1 w-full p-2.5 rounded-xl bg-black/60 border border-slate-700 font-mono text-xs text-emerald-400 select-all truncate">
                        {apiKey}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleCopyKey}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                        </button>
                        <button
                          onClick={handleGenerateApiKey}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Generate New Key</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* API Sandbox Endpoint Tester */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      <span>Live REST API Method Sandbox</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={testMethod}
                        onChange={e => setTestMethod(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>

                      <select
                        value={testEndpoint}
                        onChange={e => setTestEndpoint(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                      >
                        <option value="/api/v1.0/wall_list_home">/api/v1.0/wall_list_home (Home Feed)</option>
                        <option value="/api/v1.0/user_details?guid=1">/api/v1.0/user_details (Get User #1)</option>
                        <option value="/api/v1.0/user_friends">/api/v1.0/user_friends (Collector Friends)</option>
                        <option value="/api/v1.0/groups_view">/api/v1.0/groups_view (Active Groups)</option>
                        <option value="/api/v2.0/components/list_enabled">/api/v2.0/components/list_enabled (Components)</option>
                        <option value="/api/v1.0?method=wall_list_home">/api/v1.0?method=wall_list_home (Legacy Router)</option>
                      </select>

                      <button
                        onClick={handleExecuteApiTest}
                        disabled={isTestingApi}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                      >
                        {isTestingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Execute Call</span>
                      </button>
                    </div>

                    {/* API Output Viewer */}
                    {testResult && (
                      <div className="p-4 rounded-xl bg-black/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-cyan-400">
                            Status: {testResult.status} ({testResult.latencyMs}ms)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            OSSN Envelope Code {testResult.data?.OssnServices?.code || 100}
                          </span>
                        </div>
                        <pre className="text-xs font-mono text-slate-300 max-h-64 overflow-y-auto p-2 bg-slate-950 rounded-lg">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBSECTION 5: SYSTEM CONFIGURATION */}
              {adminSection === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Configure Subsystems</h2>
                    <p className="text-xs text-slate-400">
                      Tune site rules, maximum post length, announcements, and slab attachment permissions.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Site Announcement Banner</label>
                      <input
                        type="text"
                        value={siteSettings?.systemAnnouncement || ''}
                        onChange={e =>
                          setSiteSettings({ ...siteSettings, systemAnnouncement: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Max Post Character Limit</label>
                      <input
                        type="number"
                        value={siteSettings?.maxPostChars || 2000}
                        onChange={e =>
                          setSiteSettings({ ...siteSettings, maxPostChars: parseInt(e.target.value) })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        await fetch('/api/ossn/admin/update-settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ siteSettings })
                        });
                        alert('Site settings updated successfully!');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW C: VAULT SLABS SHOWCASE */}
        {/* ===================================================================== */}
        {activeTab === 'vault' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">VCA Collector Vault Slabs</h2>
                <p className="text-xs text-slate-400">
                  Select certified collectible slabs to attach to posts or inspect in the Forensic Lab.
                </p>
              </div>
              <button
                onClick={() => openWindow('vca')}
                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Forensic Lab</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VAULT_PRESET_SLABS.map(slab => (
                <div
                  key={slab.certNumber}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-xl hover:border-amber-500/60 transition group"
                >
                  <div className="relative aspect-[3/4] bg-black/60 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                    <img
                      src={slab.imageUrl}
                      alt={slab.cardName}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs">
                      {slab.gradeLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{slab.cardName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {slab.setName} • #{slab.certNumber}
                    </p>
                    {slab.valuation && (
                      <p className="text-xs font-bold text-emerald-400 mt-1">
                        Est. ${slab.valuation.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedSlab(slab);
                        setActiveTab('feed');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition cursor-pointer"
                    >
                      Attach to Post
                    </button>
                    <button
                      onClick={() => handleInspectInVca(slab.certNumber)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                      title="Inspect in Forensic Lab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS (THEME MANAGER & SLAB PICKER) */}
      {/* ========================================================================= */}

      {/* SLAB PICKER MODAL */}
      {isSlabPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Select a Certified Slab from VCA Vault</span>
              </h3>
              <button onClick={() => setIsSlabPickerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {VAULT_PRESET_SLABS.map(slab => (
                <div
                  key={slab.certNumber}
                  onClick={() => {
                    setSelectedSlab(slab);
                    setIsSlabPickerOpen(false);
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-amber-500/80 flex items-center gap-3 cursor-pointer transition"
                >
                  <img src={slab.imageUrl} alt={slab.cardName} className="w-12 h-16 object-contain rounded bg-black" />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                        {slab.gradeLabel}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{slab.cardName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{slab.setName}</p>
                    <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                      ${slab.valuation?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* THEME PICKER & CUSTOM IMPORT MODAL */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Pokémon Theme Studio & ZIP Packages</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Switch active theme or import a custom theme ZIP package for SlabBook.
                </p>
              </div>
              <button onClick={() => setIsThemeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {themes.map(t => (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border bg-slate-950/80 flex flex-col justify-between gap-2 cursor-pointer transition ${
                    activeTheme?.id === t.id ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-slate-800'
                  }`}
                  onClick={() => handleSwitchTheme(t.id)}
                >
                  <div style={{ background: t.colors.headerBg }} className="h-10 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-[11px] font-black text-white truncate drop-shadow">{t.name}</span>
                    {activeTheme?.id === t.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">v{t.version}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadThemeZip(t.id);
                      }}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> ZIP
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Theme ZIP Importer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">Create & Import Custom Pokémon Theme</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Theme Name (e.g. Lugia Silver)"
                  value={importThemeName}
                  onChange={e => setImportThemeName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Primary:</span>
                  <input
                    type="color"
                    value={importPrimaryColor}
                    onChange={e => setImportPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">Secondary:</span>
                  <input
                    type="color"
                    value={importSecondaryColor}
                    onChange={e => setImportSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleImportCustomTheme}
                  disabled={!importThemeName || isImporting}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs"
                >
                  {isImporting ? 'Importing...' : 'Save & Activate Theme'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
