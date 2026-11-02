"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  Image,
  Video,
  FolderOpen,
  Star,
  Plus,
  Save,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  cover: string;
  photos: GalleryPhoto[];
  published: boolean;
  featured: boolean;
  date?: string;
}

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
}

interface GalleryVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  category?: string;
  published: boolean;
}

interface GalleryData {
  albums: GalleryAlbum[];
  videos: GalleryVideo[];
}

const TABS = [
  { id: "albums",   label: "Albums",          icon: FolderOpen },
  { id: "photos",   label: "Photos (Upload)",  icon: Image      },
  { id: "videos",   label: "Videos",           icon: Video      },
  { id: "featured", label: "Featured Gallery", icon: Star       },
];

interface GalleryDashboardProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GalleryDashboard({ nav, setNav }: GalleryDashboardProps) {
  const [galleryData, setGalleryData] = useState<GalleryData>({ albums: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const activeTab = nav.section || "albums";
  const setTab = (id: string) => setNav({ page: "gallery", section: id });

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>("/gallery");
      const gallery = data?.data || data;
      setGalleryData({
        albums: gallery?.albums || [],
        videos: gallery?.videos || [],
      });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError(`Access denied: ${err.message}`);
      } else {
        setError("Failed to load gallery.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveGallery = async (updated: GalleryData) => {
    setSaving(true);
    setError("");
    try {
      await apiClient.put("/gallery", updated);
      setGalleryData(updated);
      setSuccess("Gallery saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 403 ? "Forbidden: You lack gallery:update permission." : err.message);
      } else {
        setError("Failed to save gallery.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageDashboard
      pageName="Gallery Management"
      pageDescription="Manage photo albums, videos, captions, and the featured gallery shown on the public website"
    >
      {/* ── Tab Bar ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive ? "border-amber-400 text-amber-700 bg-amber-50/60" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-40" />)}
        </div>
      ) : (
        <>
          {activeTab === "albums"   && <AlbumsTab data={galleryData} onSave={saveGallery} saving={saving} />}
          {activeTab === "photos"   && <PhotosTab data={galleryData} onSave={saveGallery} saving={saving} />}
          {activeTab === "videos"   && <VideosTab data={galleryData} onSave={saveGallery} saving={saving} />}
          {activeTab === "featured" && <FeaturedTab data={galleryData} onSave={saveGallery} saving={saving} />}
        </>
      )}
    </PageDashboard>
  );
}

// ─── Albums Tab ───────────────────────────────────────────────────────────────

function AlbumsTab({ data, onSave, saving }: { data: GalleryData; onSave: (d: GalleryData) => void; saving: boolean }) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(data.albums);
  const [showForm, setShowForm] = useState(false);
  const [editAlbum, setEditAlbum] = useState<GalleryAlbum | null>(null);
  const [form, setForm] = useState({ title: "", category: "Events", cover: "", date: "", published: true, featured: false });

  const openAdd = () => { setEditAlbum(null); setForm({ title: "", category: "Events", cover: "", date: "", published: true, featured: false }); setShowForm(true); };
  const openEdit = (a: GalleryAlbum) => { setEditAlbum(a); setForm({ title: a.title, category: a.category, cover: a.cover, date: a.date || "", published: a.published, featured: a.featured }); setShowForm(true); };

  const saveAlbum = () => {
    if (!form.title) return;
    if (editAlbum) {
      setAlbums(albums.map((a) => a.id === editAlbum.id ? { ...editAlbum, ...form } : a));
    } else {
      setAlbums([...albums, { ...form, id: "alb-" + Date.now(), photos: [] }]);
    }
    setShowForm(false);
    setEditAlbum(null);
  };

  const deleteAlbum = (id: string) => { if (confirm("Delete this album?")) setAlbums(albums.filter((a) => a.id !== id)); };
  const togglePublish = (id: string) => setAlbums(albums.map((a) => a.id === id ? { ...a, published: !a.published } : a));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
          <Plus className="w-4 h-4" /> Create Album
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">{editAlbum ? "Edit Album" : "New Album"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Album Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Annual Sports Day 2024" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["Events", "Campus Life", "Achievements", "Infrastructure", "Cultural", "Sports", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cover Image URL</label>
              <input className={inputCls} value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-amber-500" /> Published
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" /> Featured
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={saveAlbum} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
              {editAlbum ? "Update" : "Create Album"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-sm hover:border-amber-200 transition-all group">
            {album.cover ? (
              <img src={album.cover} alt={album.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <FolderOpen className="w-10 h-10 text-slate-300" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {album.featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Featured</span>}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${album.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {album.published ? "Published" : "Draft"}
                </span>
                <span className="text-[10px] text-slate-400">{album.photos.length} photos</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{album.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{album.category}{album.date ? ` · ${album.date}` : ""}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(album)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => togglePublish(album.id)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                  {album.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => deleteAlbum(album.id)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {albums.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>No albums yet. Create your first album above.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave({ ...data, albums })} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Photos Tab (URL-based upload placeholder) ────────────────────────────────

function PhotosTab({ data, onSave, saving }: { data: GalleryData; onSave: (d: GalleryData) => void; saving: boolean }) {
  const [selectedAlbum, setSelectedAlbum] = useState(data.albums[0]?.id || "");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [albums, setAlbums] = useState<GalleryAlbum[]>(data.albums);

  const album = albums.find((a) => a.id === selectedAlbum);

  const addPhoto = () => {
    if (!newPhotoUrl || !album) return;
    const photo: GalleryPhoto = { id: "ph-" + Date.now(), url: newPhotoUrl, caption: newCaption };
    setAlbums(albums.map((a) => a.id === selectedAlbum ? { ...a, photos: [...a.photos, photo] } : a));
    setNewPhotoUrl("");
    setNewCaption("");
  };

  const removePhoto = (photoId: string) => {
    setAlbums(albums.map((a) => a.id === selectedAlbum ? { ...a, photos: a.photos.filter((p) => p.id !== photoId) } : a));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-600" /> Add Photos to Album
        </h3>
        {albums.length === 0 ? (
          <p className="text-sm text-slate-400">Create an album first in the Albums tab.</p>
        ) : (
          <>
            <div>
              <label className="label">Select Album</label>
              <select className={inputCls} value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)}>
                {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Photo URL *</label>
                <input className={inputCls} value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div>
                <label className="label">Caption (optional)</label>
                <input className={inputCls} value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="Describe the photo…" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={addPhoto} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
                <Plus className="w-4 h-4" /> Add Photo
              </button>
              <span className="text-xs text-slate-400">{album?.photos.length || 0} photos in this album</span>
            </div>

            {album && album.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                {album.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt={photo.caption} className="w-full aspect-square object-cover rounded-xl border border-slate-200" />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] px-1.5 py-1 rounded-b-xl line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.caption}
                      </div>
                    )}
                    <button onClick={() => removePhoto(photo.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave({ ...data, albums })} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Videos Tab ───────────────────────────────────────────────────────────────

function VideosTab({ data, onSave, saving }: { data: GalleryData; onSave: (d: GalleryData) => void; saving: boolean }) {
  const [videos, setVideos] = useState<GalleryVideo[]>(data.videos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", thumbnail: "", category: "Events", published: true });

  const addVideo = () => {
    if (!form.title || !form.url) return;
    setVideos([...videos, { ...form, id: "v-" + Date.now() }]);
    setForm({ title: "", url: "", thumbnail: "", category: "Events", published: true });
    setShowForm(false);
  };

  const removeVideo = (id: string) => { if (confirm("Remove this video?")) setVideos(videos.filter((v) => v.id !== id)); };
  const togglePublish = (id: string) => setVideos(videos.map((v) => v.id === id ? { ...v, published: !v.published } : v));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">Add Video</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Convocation 2024" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["Events", "Campus Tour", "Achievements", "Cultural", "Sports", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">YouTube / Video URL *</label>
              <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://www.youtube.com/embed/…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Thumbnail URL</label>
              <input className={inputCls} value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://…" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addVideo} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">Add Video</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-sm hover:border-amber-200 transition-all group">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <Video className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <div className="p-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${video.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {video.published ? "Published" : "Draft"}
              </span>
              <h4 className="font-bold text-slate-800 text-sm">{video.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{video.url}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => togglePublish(video.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  {video.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {video.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => removeVideo(video.id)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-400">
            <Video className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>No videos yet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave({ ...data, videos })} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Featured Tab ─────────────────────────────────────────────────────────────

function FeaturedTab({ data, onSave, saving }: { data: GalleryData; onSave: (d: GalleryData) => void; saving: boolean }) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(data.albums);

  const toggleFeatured = (id: string) =>
    setAlbums(albums.map((a) => a.id === id ? { ...a, featured: !a.featured } : a));

  const featured = albums.filter((a) => a.featured);
  const unfeatured = albums.filter((a) => !a.featured);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-600 fill-amber-400" /> Featured Gallery
        </h3>
        <p className="text-xs text-slate-400 mb-4">These albums appear prominently on the homepage and public Gallery page.</p>

        {featured.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Currently Featured ({featured.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featured.map((album) => (
                <AlbumToggleCard key={album.id} album={album} featured={true} onToggle={() => toggleFeatured(album.id)} />
              ))}
            </div>
          </div>
        )}

        {unfeatured.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Available Albums</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unfeatured.map((album) => (
                <AlbumToggleCard key={album.id} album={album} featured={false} onToggle={() => toggleFeatured(album.id)} />
              ))}
            </div>
          </div>
        )}

        {albums.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">No albums yet. Create albums in the Albums tab first.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave({ ...data, albums })} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function AlbumToggleCard({ album, featured, onToggle }: { album: GalleryAlbum; featured: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${featured ? "border-amber-400 shadow-md shadow-amber-100" : "border-slate-200 hover:border-amber-200"}`}
      onClick={onToggle}>
      {album.cover ? (
        <img src={album.cover} alt={album.title} className="w-full h-24 object-cover" />
      ) : (
        <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-slate-300" />
        </div>
      )}
      <div className="p-2.5 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700 truncate">{album.title}</p>
        <Star className={`w-3.5 h-3.5 shrink-0 ${featured ? "text-amber-500 fill-amber-400" : "text-slate-300"}`} />
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
