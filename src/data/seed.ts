/**
 * OPTIONAL DEMO SEED DATA — clearly labeled and removable.
 * Every record created here carries `demo: true` and can be wiped from
 * Admin → Website Settings → "Remove demo content". The seed articles are
 * evergreen explainers that cite real, public primary sources; they are not
 * fabricated news reports.
 */
import type { Author, Category, Database, MediaItem, Post, SiteSettings, Source, Tag } from '../types/models';
import { readingTime } from '../utils/format';

export const LOGO_URL = "/TSC_Story_Current_Logo.png";
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61595027176516';

export const defaultSettings: SiteSettings = {
  siteName: 'The Story Current',
  siteUrl: 'https://thestorycurrent.com',
  description: 'Independent news, explainers and discoveries for readers in the US, Canada and the UK.',
  logoUrl: LOGO_URL,
  faviconUrl: LOGO_URL,
  facebookUrl: FACEBOOK_URL,
  twitterUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  contactEmail: 'contact@thestorycurrent.com',
  footerText: 'The Story Current is an independent digital publication. We cite our sources and correct our mistakes.',
  defaultSeoTitle: 'The Story Current — News, Explainers & Discoveries',
  defaultMetaDescription: 'Clear, sourced reporting on world news, sports, technology & AI, entertainment, lifestyle and fascinating discoveries.',
  defaultOgImageUrl: LOGO_URL,
  ga4Id: '',
  gscVerification: '',
  adsenseEnabled: false,
  adsenseClientId: '',
  adSlots: { homeTop: '', homeBetween: '', articleTop: '', articleInline: '', sidebar: '' },
  showAdPlaceholders: true
};

const cat = (id: string, name: string, slug: string, order: number, description: string, parentId: string | null = null): Category => ({
  id, name, slug, order, description, parentId, enabled: true,
  seoTitle: `${name} News & Explainers | The Story Current`,
  metaDescription: description,
  demo: false
});

export const defaultCategories: Category[] = [
cat('cat-world', 'World News', 'world-news', 1, 'Global affairs and international news explained clearly.'),
cat('cat-sports', 'Sports', 'sports', 2, 'NFL, NBA, MLB, soccer, tennis and more — rules, results and context.'),
cat('cat-nfl', 'NFL', 'nfl', 1, 'National Football League coverage and explainers.', 'cat-sports'),
cat('cat-nba', 'NBA', 'nba', 2, 'National Basketball Association coverage and explainers.', 'cat-sports'),
cat('cat-mlb', 'MLB', 'mlb', 3, 'Major League Baseball coverage and explainers.', 'cat-sports'),
cat('cat-soccer', 'Soccer', 'soccer', 4, 'Football around the world — leagues, rules and tournaments.', 'cat-sports'),
cat('cat-tennis', 'Tennis', 'tennis', 5, 'Grand Slams, tours and the people who play them.', 'cat-sports'),
cat('cat-other-sports', 'Other Sports', 'other-sports', 6, 'Everything else in the world of sport.', 'cat-sports'),
cat('cat-tech', 'Technology & AI', 'technology-ai', 3, 'Artificial intelligence, gadgets, security and the tech shaping daily life.'),
cat('cat-ent', 'Entertainment', 'entertainment', 4, 'Film, TV, music and culture.'),
cat('cat-life', 'Lifestyle', 'lifestyle', 5, 'Health, food, money and everyday living.'),
cat('cat-disc', 'Discoveries & Facts', 'discoveries-facts', 6, 'Science, history and fascinating facts, explained.')];


const editorial: Author = {
  id: 'auth-editorial',
  fullName: 'The Story Current Editorial Team',
  displayName: 'The Story Current Editorial Team',
  slug: 'editorial-team',
  avatarUrl: LOGO_URL,
  bio: 'Articles credited to the Editorial Team are researched, written and edited collectively by The Story Current newsroom. Every piece lists its sources so readers can verify the facts.',
  role: 'Newsroom',
  email: '',
  showEmail: false,
  website: '',
  socials: { facebook: FACEBOOK_URL },
  active: true,
  isOrganization: true
};

const IMG = {
  stadium: "/08e80113-b044-4319-ad8a-36974e8b28c8.jpg",
  tech: "/504cbe85-8113-4edb-b7bd-188629a8aa8b.jpg",
  space: "/cc151428-45a1-4c9c-9a1f-aa5fe96113c1.jpg",
  lifestyle: "/e514e205-5d14-4893-a856-7363c167db8a.jpg",
  city: "/378877c2-308e-48b3-920a-096f26f6b19a.jpg",
  cinema: "/621b633a-a304-4f8d-aa00-b784cdf97a34.jpg"
};

const media = (id: string, url: string, title: string, alt: string): MediaItem => ({
  id, url, title, alt, caption: '', credit: 'Illustrative image', license: 'Demo image — replace with licensed photography',
  mimeType: 'image/jpeg', size: 0, width: 1376, height: 768, createdAt: new Date().toISOString(), demo: true
});

const demoMedia: MediaItem[] = [
media('m-stadium', IMG.stadium, 'Football stadium at dusk', 'Floodlit American football stadium filled with fans at dusk'),
media('m-tech', IMG.tech, 'Processor chip', 'Close-up of a computer processor on a circuit board'),
media('m-space', IMG.space, 'Blue sky over coast', 'Clear blue sky with light clouds above a calm coastline'),
media('m-life', IMG.lifestyle, 'Breakfast table', 'Bright kitchen table with coffee, fruit and a healthy breakfast'),
media('m-city', IMG.city, 'City street at golden hour', 'Busy international city street with flags at golden hour'),
media('m-cinema', IMG.cinema, 'Movie theater', 'Empty movie theater with red seats facing a glowing screen')];


const src = (id: string, name: string, url: string, publisher: string, type: Source['type']): Source => ({
  id, name, url, publisher, type, publishedDate: '', note: '', demo: true
});

const demoSources: Source[] = [
src('s-un', 'United Nations General Assembly', 'https://www.un.org/en/ga/', 'United Nations', 'official'),
src('s-nfl', 'NFL Football Operations', 'https://operations.nfl.com/', 'National Football League', 'official'),
src('s-nba', 'NBA.com', 'https://www.nba.com/', 'National Basketball Association', 'official'),
src('s-nist-ai', 'NIST Artificial Intelligence', 'https://www.nist.gov/artificial-intelligence', 'National Institute of Standards and Technology', 'government'),
src('s-cisa', 'CISA — More than a Password', 'https://www.cisa.gov/MFA', 'Cybersecurity and Infrastructure Security Agency', 'government'),
src('s-mpa', 'MPA Film Ratings', 'https://www.motionpictures.org/film-ratings/', 'Motion Picture Association', 'official'),
src('s-bbfc', 'BBFC Age Ratings', 'https://www.bbfc.co.uk/', 'British Board of Film Classification', 'official'),
src('s-dga', 'Dietary Guidelines for Americans', 'https://www.dietaryguidelines.gov/', 'USDA & HHS', 'government'),
src('s-nhs', 'NHS Eat Well', 'https://www.nhs.uk/live-well/eat-well/', 'National Health Service', 'government'),
src('s-nasa', 'Why Is the Sky Blue?', 'https://spaceplace.nasa.gov/blue-sky/', 'NASA Space Place', 'government'),
src('s-rmg', 'What is a leap year?', 'https://www.rmg.co.uk/stories/topics/leap-year', 'Royal Museums Greenwich', 'research'),
src('s-nist-dst', 'Daylight Saving Time', 'https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst', 'NIST', 'government'),
src('s-ifab', 'The IFAB Laws of the Game', 'https://www.theifab.com/', 'International Football Association Board', 'official')];


const tag = (name: string): Tag => ({ id: `t-${name.toLowerCase().replace(/\s+/g, '-')}`, name, slug: name.toLowerCase().replace(/\s+/g, '-'), demo: true });
const demoTags: Tag[] = ['Explainer', 'NFL', 'NBA', 'Soccer', 'AI', 'Cybersecurity', 'Science', 'Health', 'Film', 'Time', 'Diplomacy'].map(tag);

interface DemoPostInput {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  categoryId: string;
  imageId: string;
  tags: string[];
  sources: string[];
  hoursAgo: number;
  featured?: boolean;
  breaking?: boolean;
  trending?: boolean;
  keyword: string;
}

function demoPost(p: DemoPostInput): Post {
  const published = new Date(Date.now() - p.hoursAgo * 3600 * 1000).toISOString();
  const slug = p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
  return {
    id: p.id, title: p.title, slug, subtitle: p.subtitle, excerpt: p.excerpt, content: p.body,
    categoryId: p.categoryId, authorId: 'auth-editorial', featuredImageId: p.imageId,
    tagIds: p.tags.map((t) => `t-${t.toLowerCase()}`), sources: p.sources.map((s) => ({ sourceId: s, note: '' })),
    status: 'published', isFeatured: !!p.featured, isBreaking: !!p.breaking, isTrending: !!p.trending,
    seo: { seoTitle: '', metaDescription: p.excerpt.slice(0, 158), focusKeyword: p.keyword, secondaryKeywords: '', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImageId: null, noindex: false },
    readingTime: readingTime(p.body), publishedAt: published, scheduledAt: null, createdAt: published, updatedAt: published, views: 0, demo: true
  };
}

const para = (...ps: string[]) => ps.map((t) => `<p>${t}</p>`).join('');

const demoPosts: Post[] = [
demoPost({
  id: 'p-nfl', title: 'Explained: How the NFL Playoff Format Works', keyword: 'NFL playoff format',
  subtitle: 'Fourteen teams, two conferences and one very valuable first-round bye.',
  excerpt: 'Seven teams from each conference reach the NFL postseason. Here is how seeding, wild cards and the coveted first-round bye actually work.',
  categoryId: 'cat-nfl', imageId: 'm-stadium', tags: ['NFL', 'Explainer'], sources: ['s-nfl'], hoursAgo: 3, featured: true,
  body: para('The NFL playoffs include 14 of the league\'s 32 teams: seven from the American Football Conference (AFC) and seven from the National Football Conference (NFC).', 'In each conference, the four division winners are seeded one through four based on their regular-season records. The three best remaining teams earn wild-card spots and are seeded five through seven.') +
  '<h2>Why the No. 1 seed matters</h2>' + para('Only the top seed in each conference receives a first-round bye. Every other team plays on Wild Card Weekend, with the higher seed hosting.', 'After each round, the remaining teams are re-seeded so that the highest surviving seed always hosts the lowest. The two conference champions then meet in the Super Bowl at a neutral site chosen years in advance.') +
  '<blockquote>Tiebreakers — from head-to-head results to strength of victory — are published in full by NFL Football Operations.</blockquote>'
}),
demoPost({
  id: 'p-llm', title: 'What Is a Large Language Model? A Beginner\'s Explainer', keyword: 'large language model',
  subtitle: 'The technology behind today\'s AI chatbots, minus the jargon.',
  excerpt: 'Large language models power many AI assistants. We break down how they are trained, what they are good at, and where they still fall short.',
  categoryId: 'cat-tech', imageId: 'm-tech', tags: ['AI', 'Explainer'], sources: ['s-nist-ai'], hoursAgo: 6, featured: true, trending: true,
  body: para('A large language model (LLM) is a type of artificial intelligence system trained on very large collections of text to predict which words are likely to come next in a sequence.', 'By repeating that prediction step many times, an LLM can draft emails, summarize documents, answer questions and translate between languages.') +
  '<h2>How they learn</h2>' + para('Training happens in stages. First, a model learns general language patterns from broad text data. It is then refined with curated examples and human feedback to make its answers more helpful and safer.') +
  '<h2>Known limitations</h2><ul><li>They can state incorrect information confidently.</li><li>Their knowledge can be out of date.</li><li>They may reflect biases present in training data.</li></ul>' +
  para('Organizations such as the U.S. National Institute of Standards and Technology publish frameworks to help developers and users manage AI risks.')
}),
demoPost({
  id: 'p-sky', title: 'Why Is the Sky Blue? The Science of Rayleigh Scattering', keyword: 'why is the sky blue',
  subtitle: 'Sunlight contains every color. Our atmosphere just has a favorite.',
  excerpt: 'Sunlight looks white but contains all colors. Gas molecules in the air scatter shorter blue wavelengths far more than red ones — here is why.',
  categoryId: 'cat-disc', imageId: 'm-space', tags: ['Science', 'Explainer'], sources: ['s-nasa'], hoursAgo: 9, featured: true, trending: true,
  body: para('Sunlight reaches Earth as a mix of every color in the visible spectrum. As it travels through the atmosphere, it collides with tiny gas molecules, mostly nitrogen and oxygen.', 'Those molecules scatter shorter wavelengths of light — blues and violets — much more strongly than longer red and orange wavelengths. This effect is called Rayleigh scattering.') +
  '<h2>So why not violet?</h2>' + para('Although violet scatters even more than blue, the Sun emits less violet light, some is absorbed high in the atmosphere, and our eyes are more sensitive to blue. The result is the familiar blue sky.', 'At sunrise and sunset, light passes through much more atmosphere. Most of the blue is scattered away before it reaches us, leaving the warm reds and oranges.')
}),
demoPost({
  id: 'p-un', title: 'How the United Nations General Assembly Works', keyword: 'UN General Assembly',
  subtitle: 'One country, one vote — and why most resolutions are not legally binding.',
  excerpt: 'All 193 UN member states have a seat and an equal vote in the General Assembly. Here is what it can and cannot do, explained in plain English.',
  categoryId: 'cat-world', imageId: 'm-city', tags: ['Diplomacy', 'Explainer'], sources: ['s-un'], hoursAgo: 12, featured: true,
  body: para('The General Assembly is the main deliberative body of the United Nations. Every member state has one seat and one vote, regardless of population or economic size.', 'Its regular session opens each September in New York, when world leaders gather for the high-level General Debate.') +
  '<h2>What it decides</h2>' + para('The Assembly approves the UN budget, elects non-permanent members of the Security Council and adopts resolutions on issues ranging from human rights to climate. Decisions on important questions require a two-thirds majority.', 'Most General Assembly resolutions are recommendations rather than binding international law, which is a key difference from certain Security Council decisions.')
}),
demoPost({
  id: 'p-mfa', title: 'Five Practical Ways to Protect Your Accounts With Multi-Factor Authentication', keyword: 'multi-factor authentication',
  subtitle: 'A second step at login blocks the vast majority of account takeovers.',
  excerpt: 'Multi-factor authentication adds a second check when you sign in. Government security agencies recommend turning it on everywhere you can.',
  categoryId: 'cat-tech', imageId: 'm-tech', tags: ['Cybersecurity'], sources: ['s-cisa'], hoursAgo: 20, trending: true,
  body: para('Multi-factor authentication (MFA) requires something beyond your password — such as a code from an app, a hardware key or a fingerprint — before you can sign in.') +
  '<h2>Where to start</h2><ol><li>Turn on MFA for your primary email account first.</li><li>Prefer an authenticator app or security key over SMS codes.</li><li>Save backup codes somewhere safe and offline.</li><li>Enable MFA on banking, social media and cloud storage.</li><li>Be wary of unexpected MFA prompts you did not request.</li></ol>' +
  para('The U.S. Cybersecurity and Infrastructure Security Agency maintains guidance for individuals and organizations adopting MFA.')
}),
demoPost({
  id: 'p-ratings', title: 'How Film Ratings Work in the US, UK and Canada', keyword: 'film ratings',
  subtitle: 'PG-13, 12A, 14A: decoding the letters on the poster.',
  excerpt: 'Different countries rate movies differently. We compare the systems used by the MPA in the US, the BBFC in the UK and provincial boards in Canada.',
  categoryId: 'cat-ent', imageId: 'm-cinema', tags: ['Film', 'Explainer'], sources: ['s-mpa', 's-bbfc'], hoursAgo: 28,
  body: para('In the United States, film ratings are issued by the Classification and Rating Administration, part of the Motion Picture Association. The familiar categories are G, PG, PG-13, R and NC-17.', 'In the United Kingdom, the British Board of Film Classification uses U, PG, 12A/12, 15 and 18. The 12A rating allows younger children to attend with an adult.') +
  '<h2>Canada\'s provincial approach</h2>' + para('Canada has no single national film classifier. Provinces operate their own boards, though many use similar categories such as G, PG, 14A, 18A and R.') +
  '<table><thead><tr><th>Audience</th><th>US</th><th>UK</th></tr></thead><tbody><tr><td>All ages</td><td>G</td><td>U</td></tr><tr><td>Guidance suggested</td><td>PG</td><td>PG</td></tr><tr><td>Teens</td><td>PG-13</td><td>12A / 15</td></tr><tr><td>Adults</td><td>R / NC-17</td><td>18</td></tr></tbody></table>'
}),
demoPost({
  id: 'p-breakfast', title: 'Building a Better Breakfast: What Dietary Guidelines Recommend', keyword: 'healthy breakfast',
  subtitle: 'Official advice from both sides of the Atlantic has more in common than you might think.',
  excerpt: 'US and UK public health guidance both emphasize fruit, vegetables, whole grains and limiting added sugar. Here is how that translates to breakfast.',
  categoryId: 'cat-life', imageId: 'm-life', tags: ['Health'], sources: ['s-dga', 's-nhs'], hoursAgo: 34,
  body: para('The Dietary Guidelines for Americans and the NHS Eatwell Guide in the UK share core principles: eat a variety of fruit and vegetables, choose whole grains, and limit added sugars, saturated fat and salt.') +
  '<h2>Putting it on the plate</h2><ul><li>Choose whole-grain cereals, oats or bread.</li><li>Add fruit for natural sweetness and fiber.</li><li>Include a protein source such as eggs, yogurt or nuts.</li><li>Check labels for added sugar in cereals and drinks.</li></ul>' +
  para('This article is general information, not personal medical advice. Speak with a qualified professional about your own dietary needs.')
}),
demoPost({
  id: 'p-offside', title: 'Offside Explained: The Soccer Rule Everyone Argues About', keyword: 'offside rule',
  subtitle: 'It is simpler than it looks — mostly.',
  excerpt: 'The offside law stops attackers from waiting beside the goal. Here is what the IFAB Laws of the Game actually say, with the key exceptions.',
  categoryId: 'cat-soccer', imageId: 'm-stadium', tags: ['Soccer', 'Explainer'], sources: ['s-ifab'], hoursAgo: 40, trending: true,
  body: para('Under Law 11 of the Laws of the Game, a player is in an offside position if any part of the head, body or feet is in the opponents\' half and nearer to the goal line than both the ball and the second-last opponent.', 'Being in an offside position is not an offence by itself. A player is penalized only if they become involved in active play when the ball is played by a teammate.') +
  '<h2>Key exceptions</h2><ul><li>No offside from a goal kick, throw-in or corner kick.</li><li>Hands and arms are not considered when judging position.</li><li>A player level with the second-last opponent is onside.</li></ul>'
}),
demoPost({
  id: 'p-playin', title: 'What the NBA Play-In Tournament Is and Why It Exists', keyword: 'NBA play-in tournament',
  subtitle: 'Seeds seven through ten get one more chance to make the playoffs.',
  excerpt: 'The NBA Play-In Tournament decides the final two playoff spots in each conference. Here is how the bracket works.',
  categoryId: 'cat-nba', imageId: 'm-stadium', tags: ['NBA', 'Explainer'], sources: ['s-nba'], hoursAgo: 52, breaking: true,
  body: para('The top six teams in each NBA conference qualify directly for the playoffs. Teams finishing seventh through tenth enter the Play-In Tournament.', 'The seventh seed hosts the eighth; the winner claims the No. 7 playoff spot. The ninth seed hosts the tenth, and the loser is eliminated.') +
  '<h2>The final game</h2>' + para('The loser of the 7-vs-8 game hosts the winner of the 9-vs-10 game. The winner of that matchup becomes the eighth playoff seed.')
}),
demoPost({
  id: 'p-leap', title: 'Leap Years Explained: Why February Sometimes Has 29 Days', keyword: 'leap year',
  subtitle: 'Earth takes about 365.25 days to orbit the Sun — and that quarter day adds up.',
  excerpt: 'Without leap years, our calendar would drift away from the seasons. Here is the rule, including the century exception most people forget.',
  categoryId: 'cat-disc', imageId: 'm-space', tags: ['Science', 'Time'], sources: ['s-rmg'], hoursAgo: 70, breaking: true,
  body: para('A year on Earth — the time it takes to orbit the Sun — is roughly 365.2422 days. Adding a day to February every four years keeps the calendar aligned with the seasons.') +
  '<h2>The century rule</h2>' + para('Because 365.25 slightly overcorrects, the Gregorian calendar skips leap years in century years unless they are divisible by 400. That is why 2000 was a leap year but 1900 was not.')
}),
demoPost({
  id: 'p-dst', title: 'Daylight Saving Time: When the Clocks Change in the US, UK and Canada', keyword: 'daylight saving time',
  subtitle: 'The dates differ by a few weeks on either side of the Atlantic.',
  excerpt: 'The US, Canada and the UK all shift clocks twice a year, but not on the same dates. Here is a simple guide to who changes and when.',
  categoryId: 'cat-life', imageId: 'm-city', tags: ['Time'], sources: ['s-nist-dst'], hoursAgo: 90,
  body: para('In most of the United States and Canada, daylight saving time begins on the second Sunday in March and ends on the first Sunday in November.', 'In the United Kingdom, British Summer Time begins on the last Sunday in March and ends on the last Sunday in October.') +
  '<h2>Exceptions</h2>' + para('Not every region participates. Most of Arizona and Hawaii in the US stay on standard time year-round, as does most of Saskatchewan in Canada.')
})];


export function createSeedDatabase(): Database {
  return {
    version: 1,
    adminUsers: [],
    authors: [editorial],
    categories: defaultCategories,
    tags: demoTags,
    posts: demoPosts,
    sources: demoSources,
    media: demoMedia,
    messages: [],
    subscribers: [],
    settings: defaultSettings,
    activity: []
  };
}