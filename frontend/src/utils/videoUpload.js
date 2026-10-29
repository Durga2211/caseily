/**
 * Video Upload Helper for Caseily Reels
 * Supports:
 * 1. Direct browser-to-Cloudinary signed upload (via backend signature)
 * 2. Direct browser-to-Cloudinary unsigned upload (via VITE_CLOUDINARY_UPLOAD_PRESET)
 * 3. Direct server upload fallback
 *
 * Direct client uploads bypass Vercel's 4.5MB request limit completely.
 */

export async function uploadReelVideo({ file, token, API_URL, onProgress }) {
  if (!file) throw new Error('No video file provided');

  // Validate file size (100MB max)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 100MB.`);
  }

  // 1. Try backend signed signature for Cloudinary
  let signatureData = null;
  if (token) {
    try {
      const sigRes = await fetch(`${API_URL || ''}/api/admin/reels/upload-signature`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sigRes.ok) {
        const json = await sigRes.json();
        if (json.configured) {
          signatureData = json;
        }
      }
    } catch {
      // Signature endpoint not reachable or errored; fallback to next method
    }
  }

  // If signed Cloudinary is available:
  if (signatureData) {
    return uploadToCloudinarySigned(file, signatureData, onProgress);
  }

  // 2. Try frontend unsigned Cloudinary upload preset
  const clientCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const clientPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (clientCloudName && clientPreset) {
    return uploadToCloudinaryUnsigned(file, clientCloudName, clientPreset, onProgress);
  }

  // 3. Fallback: Server multipart upload
  // Warn when file is large and Cloudinary is not configured — Vercel has a 4.5 MB body limit.
  const VERCEL_LIMIT_MB = 4.5;
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > VERCEL_LIMIT_MB) {
    throw new Error(
      `Video is ${fileSizeMB.toFixed(1)} MB. Without Cloudinary configured, Vercel's 4.5 MB request limit blocks this upload. ` +
      `Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env and Vercel environment variables. ` +
      `Alternatively add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env for direct browser uploads.`
    );
  }
  return uploadToServerFallback(file, token, API_URL, onProgress);
}

function uploadToCloudinarySigned(file, sig, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`;
    const form = new FormData();

    form.append('file', file);
    form.append('api_key', sig.api_key);
    form.append('timestamp', sig.timestamp);
    form.append('signature', sig.signature);
    form.append('folder', sig.folder || 'caseily/reels');

    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct, `Uploading to Cloud CDN (${pct}%)`);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          // Generate poster thumbnail at frame 0
          let thumb = data.secure_url.replace(/\.[^/.]+$/, '.jpg');
          if (thumb.includes('/video/upload/')) {
            thumb = thumb.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,w_720/');
          }
          resolve({
            video_url: data.secure_url,
            thumbnail_url: thumb,
            storage_id: data.public_id,
            duration: data.duration || 0,
            mime_type: 'video/mp4'
          });
        } else {
          reject(new Error(data.error?.message || 'Cloudinary upload failed'));
        }
      } catch {
        reject(new Error('Invalid response from cloud storage'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error uploading video to cloud storage'));
    xhr.send(form);
  });
}

function uploadToCloudinaryUnsigned(file, cloudName, preset, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    const form = new FormData();

    form.append('file', file);
    form.append('upload_preset', preset);
    form.append('folder', 'caseily/reels');

    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct, `Uploading to Cloud CDN (${pct}%)`);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          let thumb = data.secure_url.replace(/\.[^/.]+$/, '.jpg');
          if (thumb.includes('/video/upload/')) {
            thumb = thumb.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,w_720/');
          }
          resolve({
            video_url: data.secure_url,
            thumbnail_url: thumb,
            storage_id: data.public_id,
            duration: data.duration || 0,
            mime_type: 'video/mp4'
          });
        } else {
          reject(new Error(data.error?.message || 'Cloudinary upload failed'));
        }
      } catch {
        reject(new Error('Invalid response from cloud storage'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error uploading video to cloud storage'));
    xhr.send(form);
  });
}

function uploadToServerFallback(file, token, API_URL, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('caption', 'temporary');
    form.append('video', file);

    xhr.open('POST', `${API_URL || ''}/api/admin/reels`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct, `Uploading (${pct}%)`);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.reel) {
          resolve({
            video_url: data.reel.video_url || data.reel.video,
            thumbnail_url: data.reel.thumbnail_url,
            storage_id: data.reel.storage_id,
            duration: data.reel.duration || 0,
            mime_type: data.reel.mime_type || 'video/mp4',
            reel: data.reel
          });
        } else {
          reject(new Error(data.detail || 'Upload failed'));
        }
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
}

/**
 * Capture a quick snapshot of the local video file for instant client-side preview
 */
export function captureVideoPreviewFrame(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.5;

      video.onloadeddata = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 360;
          canvas.height = video.videoHeight || 640;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(url);
          resolve({ previewUrl: dataUrl, duration: video.duration || 0 });
        } catch {
          URL.revokeObjectURL(url);
          resolve({ previewUrl: null, duration: 0 });
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ previewUrl: null, duration: 0 });
      };
    } catch {
      resolve({ previewUrl: null, duration: 0 });
    }
  });
}
