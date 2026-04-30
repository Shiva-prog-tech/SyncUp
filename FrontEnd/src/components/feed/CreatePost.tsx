// import { useState } from 'react';
// import { Image, Globe, X, Loader2, Smile } from 'lucide-react';
// import { Avatar } from '../ui/Avatar';
// import { api } from '../../lib/api';
// import { useAuth } from '../../context/AuthContext';

// export function CreatePost({ onPost }: { onPost: (post: any) => void }) {
//   const { user } = useAuth();
//   const [expanded, setExpanded] = useState(false);
//   const [content, setContent] = useState('');
//   const [imageUrl, setImageUrl] = useState('');
//   const [showImageInput, setShowImageInput] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handlePost = async () => {
//     if (!content.trim()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const post = await api.createPost({ content, imageUrl: imageUrl || undefined });
//       onPost(post);
//       setContent('');
//       setImageUrl('');
//       setShowImageInput(false);
//       setExpanded(false);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKey = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && e.ctrlKey) handlePost();
//   };

//   return (
//     <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
//       <div className="flex gap-3">
//         <Avatar src={user?.avatarUrl} alt={user?.name} size="md" online />
//         <div className="flex-1">
//           {!expanded ? (
//             <button
//               onClick={() => setExpanded(true)}
//               className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
//               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
//             >
//               What's happening in tech today?
//             </button>
//           ) : (
//             <div>
//               <textarea
//                 autoFocus
//                 value={content}
//                 onChange={e => setContent(e.target.value)}
//                 onKeyDown={handleKey}
//                 placeholder="Share insights, updates, or start a discussion..."
//                 rows={4}
//                 className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-all"
//                 style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
//               />
//               {showImageInput && (
//                 <div className="mt-2 flex gap-2">
//                   <input
//                     type="url"
//                     value={imageUrl}
//                     onChange={e => setImageUrl(e.target.value)}
//                     placeholder="https://image-url.com/photo.jpg"
//                     className="flex-1 h-9 px-3 rounded-lg text-xs outline-none"
//                     style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
//                   />
//                   <button onClick={() => { setShowImageInput(false); setImageUrl(''); }} style={{ color: 'var(--text-muted)' }}>
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}
//               {imageUrl && (
//                 <div className="mt-2 rounded-xl overflow-hidden">
//                   <img src={imageUrl} alt="preview" className="w-full max-h-48 object-cover" onError={() => setImageUrl('')} />
//                 </div>
//               )}
//               {error && <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{error}</p>}
//             </div>
//           )}
//         </div>
//       </div>

//       {expanded && (
//         <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
//           <div className="flex gap-1">
//             <ActionBtn icon={<Image className="w-4 h-4" />} label="Image" onClick={() => setShowImageInput(!showImageInput)} active={showImageInput} />
//             <ActionBtn icon={<Smile className="w-4 h-4" />} label="Emoji" />
//             <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>
//               <Globe className="w-3.5 h-3.5" />
//               <span>Public</span>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => { setExpanded(false); setContent(''); setImageUrl(''); }}
//               className="h-8 px-3 rounded-full text-xs font-medium transition-all"
//               style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handlePost}
//               disabled={!content.trim() || loading}
//               className="h-8 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
//               style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
//             >
//               {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
//               Post
//             </button>
//           </div>
//         </div>
//       )}

//       {!expanded && (
//         <div className="flex gap-2 mt-4">
//           {[
//             { icon: <Image className="w-4 h-4" />, label: 'Photo', color: 'var(--accent-cyan)' },
//             { icon: <Globe className="w-4 h-4" />, label: 'Article', color: 'var(--accent-violet)' },
//           ].map(({ icon, label, color }) => (
//             <button
//               key={label}
//               onClick={() => setExpanded(true)}
//               className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 justify-center"
//               style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
//             >
//               <span style={{ color }}>{icon}</span>
//               {label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function ActionBtn({ icon, label, onClick, active }: any) {
//   return (
//     <button
//       onClick={onClick}
//       className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
//       style={{
//         color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
//         background: active ? 'var(--accent-cyan-dim)' : 'transparent',
//       }}
//     >
//       {icon}
//       <span className="hidden sm:block">{label}</span>
//     </button>
//   );
// }


import { useState, useRef } from 'react';
import { Image, Globe, X, Loader2, Camera, Film, Link2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type MediaMode = 'none' | 'gallery' | 'camera' | 'url';

export function CreatePost({ onPost }: { onPost: (post: any) => void }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [mediaMode, setMediaMode] = useState<MediaMode>('none');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const reset = () => {
    setContent('');
    setImageUrl('');
    setImagePreview('');
    setUrlInput('');
    setMediaMode('none');
    setExpanded(false);
    stopCamera();
  };

  // --- Gallery / File picker ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageUrl(result); // base64 — backend can handle or you swap with upload URL
    };
    reader.readAsDataURL(file);
  };

  // --- Camera ---
  const openCamera = async () => {
    setMediaMode('camera');
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setCameraStream(stream);
      // give DOM time to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => setCameraReady(true));
        }
      }, 100);
    } catch {
      setError('Camera access denied. Please allow camera permission.');
      setMediaMode('none');
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    setImageUrl(dataUrl);
    stopCamera();
    setMediaMode('gallery'); // show preview mode
  };

  // --- URL input ---
  const applyUrl = () => {
    if (!urlInput.trim()) return;
    setImagePreview(urlInput.trim());
    setImageUrl(urlInput.trim());
    setMediaMode('none');
  };

  // --- Submit post ---
  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      // For base64 images: send as imageUrl (server stores string).
      // For production swap with a multipart upload endpoint.
      const post = await api.createPost({ content, imageUrl: imageUrl || undefined });
      onPost(post);
      reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageUrl('');
    setUrlInput('');
    setMediaMode('none');
    stopCamera();
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Hidden file inputs */}
      <input ref={galleryRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} alt={user?.name} size="md" online />
        <div className="flex-1 min-w-0">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              What's happening in tech today?
            </button>
          ) : (
            <>
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handlePost()}
                placeholder="Share insights, updates, or start a discussion..."
                rows={4}
                className="w-full resize-none rounded-xl p-3 text-sm outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
              />

              {/* Camera live view */}
              {mediaMode === 'camera' && (
                <div className="mt-2 rounded-xl overflow-hidden relative" style={{ background: '#000', minHeight: 200 }}>
                  <video ref={videoRef} className="w-full rounded-xl" playsInline muted style={{ display: 'block' }} />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraReady}
                      className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                    <button onClick={() => { stopCamera(); setMediaMode('none'); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center self-center"
                      style={{ background: 'rgba(255,90,114,0.8)' }}>
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* URL input mode */}
              {mediaMode === 'url' && (
                <div className="mt-2 flex gap-2">
                  <input
                    autoFocus
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyUrl()}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 h-9 px-3 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
                  />
                  <button onClick={applyUrl} className="px-3 h-9 rounded-lg text-xs font-semibold" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>Add</button>
                  <button onClick={() => setMediaMode('none')} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Image preview */}
              {imagePreview && mediaMode !== 'camera' && (
                <div className="mt-2 relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="preview" className="w-full max-h-60 object-cover rounded-xl"
                    onError={() => { setImagePreview(''); setError('Could not load image.'); }} />
                  <button onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(12,13,18,0.7)' }}>
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}

              {error && <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{error}</p>}
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-0.5">
            {/* Gallery */}
            <MediaBtn
              icon={<Image className="w-4 h-4" />}
              label="Gallery"
              active={!!imagePreview && mediaMode !== 'camera'}
              onClick={() => {
                if (imagePreview) { removeImage(); } else { galleryRef.current?.click(); }
              }}
            />
            {/* Camera */}
            <MediaBtn
              icon={<Camera className="w-4 h-4" />}
              label="Camera"
              active={mediaMode === 'camera'}
              onClick={() => mediaMode === 'camera' ? (stopCamera(), setMediaMode('none')) : openCamera()}
            />
            {/* URL */}
            <MediaBtn
              icon={<Link2 className="w-4 h-4" />}
              label="URL"
              active={mediaMode === 'url'}
              onClick={() => setMediaMode(m => m === 'url' ? 'none' : 'url')}
            />
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
              <Globe className="w-3.5 h-3.5" /><span className="hidden sm:block">Public</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="h-8 px-3 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button onClick={handlePost} disabled={!content.trim() || loading}
              className="h-8 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
              style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Post
            </button>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="flex gap-2 mt-4">
          {[
            { icon: <Image className="w-4 h-4" />, label: 'Photo / Video', color: 'var(--accent-cyan)', action: () => { setExpanded(true); setTimeout(() => galleryRef.current?.click(), 50); } },
            { icon: <Camera className="w-4 h-4" />, label: 'Camera', color: 'var(--accent-violet)', action: () => { setExpanded(true); setTimeout(() => openCamera(), 100); } },
            { icon: <Film className="w-4 h-4" />, label: 'Article', color: 'var(--accent-amber)', action: () => setExpanded(true) },
          ].map(({ icon, label, color, action }) => (
            <button key={label} onClick={action}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium flex-1 transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
              <span style={{ color }}>{icon}</span>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: active ? 'var(--accent-cyan-dim)' : 'transparent' }}>
      {icon}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}