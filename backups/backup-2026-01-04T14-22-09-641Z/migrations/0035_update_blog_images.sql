-- Update blog sample data with AI-generated images
-- Replace placeholder images with properly generated climbing-related images

UPDATE blog_posts SET image_url = 'https://www.genspark.ai/api/files/s/SNEjMzDc?cache_control=3600' 
WHERE slug = 'multipitch-climbing-guide';

UPDATE blog_posts SET image_url = 'https://www.genspark.ai/api/files/s/AJjb3IAh?cache_control=3600' 
WHERE slug = 'v-grade-complete-guide';

UPDATE blog_posts SET image_url = 'https://www.genspark.ai/api/files/s/FvmktNvq?cache_control=3600' 
WHERE slug = 'climbing-and-environment';

UPDATE blog_posts SET image_url = 'https://www.genspark.ai/api/files/s/48KiPwhW?cache_control=3600' 
WHERE slug = 'choosing-climbing-gym';

UPDATE blog_posts SET image_url = 'https://www.genspark.ai/api/files/s/PbDhQ9qQ?cache_control=3600' 
WHERE slug = 'shoes-review-2024';
