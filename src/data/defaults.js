const MISSION =
  'To fulfill the social responsibility of our divine mandate through meeting the needs of the less privileged people of Nigerian society via providing them with humanitarian and empowerment support thereby restoring hope and dignity to them in our society.';

const VISION =
  'To become a humanitarian organization renowned for providing a platform where individuals irrespective of their backgrounds can transition from just existing to fulfilling life purpose.';

const OUR_STORY =
  "Divine Gospel Delight Foundation was founded as an offshoot of our divine mandate of propagating the Gospel through service for humanity. We started from meeting small needs of people in the neighborhood with focus on widows, orphans, teenage children, retirees etc. Our passion is growing into family enrichment programs for effective parenting and achieving sustainability in family lives. We are also progressing to becoming a foundation committed to people's health, education and spiritual enrichment across Nigeria and to other parts of the world.";

/** Default nested CMS document seeded when the collection is empty */
export const DEFAULT_CMS_DOCUMENT = {
  home: {
    hero: {
      headline: 'Restoring Hope and Dignity to Every Life',
      paragraph:
        'We exist to meet the needs of the less privileged through humanitarian and empowerment support — a faith-filled calling to restore hope, dignity, and purpose across Nigerian communities.',
    },
    mission: {
      title: 'Our Mission',
      body: MISSION,
    },
    visionMandateImpact: {
      vision: VISION,
      mandate:
        'Propagating the Gospel through service for humanity — restoring hope and dignity to the less privileged.',
      impactSummary:
        'Serving widows, orphans, teenagers, retirees, and families — and growing into health, education, and spiritual enrichment across Nigeria and beyond.',
    },
    impactStats: {
      livesImpacted: 12000,
      outreaches: 45,
      volunteers: 150,
      successRate: 92,
    },
    donateCta: {
      headline: 'Sow Into Hope and Dignity',
      subtext:
        'Your gift helps us fulfill our divine mandate — meeting needs, empowering families, and restoring hope across Nigerian communities.',
    },
  },
  about: {
    hero: {
      headline: 'Propagating the Gospel Through Service for Humanity',
      subtext:
        'Divine Gospel Delight Foundation was founded as an offshoot of our divine mandate of propagating the Gospel through service for humanity.',
    },
    story: {
      title: 'Our Story',
      body: OUR_STORY,
    },
    mandateQuote: {
      quote:
        'Restoring hope and dignity — helping people transition from just existing to fulfilling life purpose.',
    },
    leadership: {
      heading: 'Our Leadership',
      subtext: 'Guided by faith and compassion to serve the less privileged.',
    },
  },
  founder: {
    profile: {
      label: 'Our Leaders',
      name: "Rev'd Mrs Folake Ojo",
      role: 'President / Chairperson',
      photoUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1500&fit=crop',
      intro:
        'Meet the servants guiding Divine Gospel Delight Foundation — leading with faith, compassion, and a heart for the less privileged.',
    },
    article: {
      label: 'Our Story',
      headline: 'Propagating the Gospel through service for humanity',
      body: OUR_STORY.split(/(?<=\.)\s+/).join('\n\n'),
    },
    quote: {
      quote: VISION,
      attribution: 'Divine Gospel Delight Foundation',
    },
    cta: {
      headline: 'Walk With Us in This Mandate',
      body: 'Your partnership helps us restore hope, empower families, and point people toward purpose across Nigeria.',
      primaryLabel: 'Support Our Work',
      secondaryLabel: 'Back to About',
    },
  },
  gallery: {
    hero: {
      label: 'Our Gallery',
      headline: 'Capturing Every Act of Service',
      body: 'Moments from our outreach among widows, orphans, families, and neighbors — where compassion meets dignity and the Gospel is lived out in service.',
    },
    testimonial: {
      quote:
        'Divine Gospel Delight Foundation didn’t just offer help — they offered hope. Our neighborhood felt seen, valued, and strengthened by their service.',
      name: 'Community Neighbor',
      role: 'Outreach Beneficiary',
      photoUrl:
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    },
    cta: {
      headline: 'Be Part of the Next Chapter',
      body: 'Your support helps us continue serving communities and capturing stories of hope across Nigeria.',
      primaryLabel: 'Donate Now',
      secondaryLabel: 'Contact Us',
    },
  },
  donate: {
    hero: {
      headline: 'Restore Hope. Uplift Dignity.',
      subtext:
        'Your gift helps us meet the needs of widows, orphans, retirees, and families — providing humanitarian and empowerment support that restores hope across Nigeria.',
    },
    impactStats: {
      peopleReached: 12000,
      outreaches: 45,
    },
    testimonial: {
      quote:
        'Giving through this foundation feels like planting hope. You can see compassion and dignity in the way they serve.',
      donorName: 'A Faithful Partner',
      donorRole: 'Monthly Supporter',
    },
  },
  contact: {
    hero: {
      headline: 'We Would Love to Hear from You',
      subtext:
        'Whether you want to partner with us, volunteer, ask about our programmes, or share a word of encouragement — our team is ready to listen with grace.',
    },
    info: {
      phone: '08037310730\n08033705759',
      email: 'divinegospeldelight.ministry@gmail.com',
      address: 'Lagos, Nigeria',
      officeHours: 'Monday – Friday: 9:00 AM – 5:00 PM',
    },
    social: {
      facebook: 'https://facebook.com/dgdelightfound',
      instagram: 'https://instagram.com/dgdelightfound',
      youtube: 'https://youtube.com/@dgdelightfound',
    },
  },
  lastUpdatedAt: new Date().toISOString(),
};

/** Default site settings singleton */
export const DEFAULT_SITE_SETTINGS = {
  organization: {
    name: 'Divine Gospel Delight Foundation',
    tagline: 'Restoring Hope and Dignity to Every Life',
    logoUrl: '',
    logoPublicId: '',
  },
  contact: {
    phone: '08037310730\n08033705759',
    email: 'divinegospeldelight.ministry@gmail.com',
    address: 'Lagos, Nigeria',
    officeHours: 'Monday – Friday: 9:00 AM – 5:00 PM',
  },
  social: {
    facebook: 'https://facebook.com/dgdelightfound',
    instagram: 'https://instagram.com/dgdelightfound',
    youtube: 'https://youtube.com/@dgdelightfound',
    twitter: 'https://twitter.com/dgdelightfound',
  },
  lastUpdatedAt: new Date().toISOString(),
};

/** Default published leadership shown on About and Meet Our Leaders */
export const DEFAULT_LEADERSHIP = [
  {
    name: "Rev'd Mrs Folake Ojo",
    role: 'President / Chairperson',
    bio: 'Rev\'d Mrs Folake Ojo serves as President and Chairperson of Divine Gospel Delight Foundation. With a heart for gospel-centered service, she guides the foundation’s work of restoring hope and dignity to the less privileged across Nigeria.',
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop',
    publicId: '',
    sortOrder: 1,
    status: 'published',
    isFounder: true,
  },
  {
    name: 'Bolanle Ojo',
    role: 'Secretary',
    bio: 'Bolanle Ojo serves as Secretary of Divine Gospel Delight Foundation. He helps coordinate the foundation’s outreach and administrative work so widows, orphans, families, and communities can be served with care and excellence.',
    photoUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1000&fit=crop',
    publicId: '',
    sortOrder: 2,
    status: 'published',
    isFounder: false,
  },
];
