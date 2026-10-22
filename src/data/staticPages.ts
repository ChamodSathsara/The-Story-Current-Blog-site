export interface StaticPageContent {
  slug: string;
  title: string;
  description: string;
  sections: {heading: string;body: string[];}[];
}

export const staticPages: StaticPageContent[] = [
{
  slug: 'about',
  title: 'About The Story Current',
  description: 'Who we are, what we cover and how we work.',
  sections: [
  { heading: 'Our mission', body: ['The Story Current is an independent digital publication for readers in the United States, Canada and the United Kingdom. We explain the news clearly and show our sources so readers can verify what we report.'] },
  { heading: 'What we cover', body: ['World news, sports, technology and artificial intelligence, entertainment, lifestyle, and discoveries and interesting facts.'] },
  { heading: 'How we are funded', body: ['The Story Current is supported by advertising. Advertisers have no influence over our editorial decisions, and advertisements are always clearly labeled.'] }]

},
{
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  description: 'How The Story Current collects, uses and protects your information.',
  sections: [
  { heading: 'Information we collect', body: ['When you contact us, we collect your name, email address and message. When you subscribe to our newsletter, we collect your email address, optional name, and a record of your consent including the date and time.', 'We collect standard technical information such as browser type and pages visited through analytics tools only if you accept analytics cookies.'] },
  { heading: 'Cookies and advertising', body: ['We use essential cookies required for the site to function. With your consent, we use Google Analytics to understand readership, and Google AdSense to display advertising. Google may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising at Google Ads Settings.', 'You can change your cookie choice at any time by clearing your browser storage for this site.'] },
  { heading: 'Your rights', body: ['Depending on where you live — including under the UK GDPR, Canada\'s PIPEDA and US state privacy laws such as the CCPA — you may have the right to access, correct or delete your personal information. Contact us using the details on our Contact page to make a request.'] },
  { heading: 'Data retention', body: ['We keep contact messages only as long as needed to respond, and newsletter records until you unsubscribe or ask us to delete them.'] }]

},
{
  slug: 'terms-and-conditions',
  title: 'Terms & Conditions',
  description: 'The terms that apply when you use The Story Current.',
  sections: [
  { heading: 'Use of content', body: ['All original content on The Story Current is protected by copyright. You may share links and short excerpts with attribution. Republishing full articles requires written permission.'] },
  { heading: 'Accuracy', body: ['We work hard to ensure accuracy and correct errors promptly, but content is provided for general information and does not constitute professional, legal, financial or medical advice.'] },
  { heading: 'External links', body: ['We link to external sources for attribution and context. We are not responsible for the content of external websites.'] }]

},
{
  slug: 'editorial-policy',
  title: 'Editorial Policy',
  description: 'The standards that guide our reporting.',
  sections: [
  { heading: 'Accuracy and sourcing', body: ['Every factual claim should be supported by a credible source. We list primary sources in a Sources & References section beneath each article whenever possible.', 'We do not republish other publications\' articles. Source attribution does not replace copyright permission.'] },
  { heading: 'Attribution and bylines', body: ['Articles are attributed accurately. Pieces researched and written collectively are credited to The Story Current Editorial Team. We never invent author identities or credentials.'] },
  { heading: 'Independence', body: ['Advertising and editorial are strictly separated. Advertisers cannot review or influence our coverage.'] }]

},
{
  slug: 'corrections-policy',
  title: 'Corrections Policy',
  description: 'How we handle errors and updates.',
  sections: [
  { heading: 'Reporting an error', body: ['If you believe we have made an error, please contact us through the Contact page with the article link and details of the issue.'] },
  { heading: 'How we correct', body: ['We review every correction request. When we correct a substantive error, we update the article, change the "Last updated" date, and add a note describing the correction.'] }]

}];