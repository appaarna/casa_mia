-- Add YouTube-specific columns to subjects
ALTER TABLE subjects
  ADD COLUMN youtube_playlist_id VARCHAR(255) NULL AFTER description,
  ADD COLUMN thumbnail_url VARCHAR(2048) NULL AFTER youtube_playlist_id,
  ADD COLUMN source_type VARCHAR(50) NOT NULL DEFAULT 'manual' AFTER thumbnail_url;

ALTER TABLE subjects
  ADD UNIQUE KEY uq_subjects_youtube_playlist_id (youtube_playlist_id);

-- Add YouTube-specific columns to videos
ALTER TABLE videos
  ADD COLUMN youtube_video_id VARCHAR(255) NULL AFTER description,
  ADD COLUMN thumbnail_url VARCHAR(2048) NULL AFTER youtube_url,
  ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT TRUE AFTER duration_seconds;

-- Make videos.description nullable
ALTER TABLE videos
  MODIFY COLUMN description TEXT NULL;

-- Add unique constraint for youtube_video_id within a section
ALTER TABLE videos
  ADD UNIQUE KEY uq_videos_youtube_video_section (youtube_video_id, section_id);
