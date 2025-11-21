# **App Name**: Willow

## Core Features:

- Trending Media Display: Display trending movies and TV shows in a hero banner and carousel format.
- Deferred Category Loading: Load additional media categories (Popular, Top Rated, etc.) on demand via client-side fetching.
- Interactive Media Cards: Display movie/TV show posters with interactive overlays on hover.
- Watchlist Management: Allow users to add movies/TV shows to their watchlist, storing data in Firestore (if logged in) or localStorage (if guest).
- Video Player: Provide a full-screen video player for streaming content from various sources, tracking watch progress.
- Theme Customization: Allow users to customize the app's theme (dark/light), including background effects (blobs, starfield).
- User Data Management Tool: Provide functions to manage user data, abstracting storage logic (Firestore vs localStorage) based on login status. This includes managing watchlist updates.

## Style Guidelines:

- Background color: Very dark, near-black (HSL 0, 0%, 2%) for a luxurious feel. Hex code: #050505
- Primary color: White (HSL 0, 0%, 100%) for interactive elements and highlights. Hex code: #FFFFFF
- Accent color: Warm amber (HSL 45, 90%, 55%) for secondary highlights. Hex code: #F2B331
- Card background: Slightly lighter than main background (HSL 240, 5%, 12%) to create depth. Hex code: #1E1F29
- Body and headline font: 'Inter' sans-serif for a modern, clean look.
- Consistent grid system and generous spacing for a luxurious and clear layout.
- Subtle fade-in and slide-up page transitions. 'Lift' effect on card hover with translateY and boxShadow. Subtle background pans or gradient shifts on button hover.
- Use 'lucide-react' icons throughout the app for a consistent and modern look.