/** Default nested CMS document seeded when the collection is empty */
export const DEFAULT_CMS_DOCUMENT = {
  home: {
    hero: {
      headline: 'Restoring Hope and Dignity to the Heart of Nigeria.',
      paragraph:
        'We are a humanitarian foundation dedicated to empowering underserved communities through sustainable health, education, and spiritual guidance. Every soul deserves a chance at delight.',
    },
    mission: {
      title: 'Our Mission',
      body: 'To preach the gospel, serve the vulnerable, and empower communities with compassion, dignity, and hope across Nigeria.',
    },
    visionMandateImpact: {
      vision: 'Building a Nigeria where delight is a common heritage.',
      mandate:
        'To preach the gospel, serve the vulnerable, and empower communities with compassion, dignity, and hope.',
      impactSummary:
        'We believe in measurable, sustainable change that outlives our physical presence — impact over optics.',
    },
    impactStats: {
      livesImpacted: 12000,
      outreaches: 45,
      volunteers: 150,
      successRate: 92,
    },
    donateCta: {
      headline: 'Your Generosity Fuels Transformation',
      subtext:
        'Join partners across Nigeria in restoring hope through education, health, and community outreach.',
    },
  },
  about: {
    hero: {
      headline: 'Crafting a Legacy of Hope & Excellence in Nigeria.',
      subtext:
        'Divine Gospel Delight Foundation stands as a beacon of refined philanthropy, dedicated to restoring dignity and creating sustainable impact.',
    },
    story: {
      title: 'Our Foundation Story',
      body: 'Divine Gospel Delight Foundation was founded on the conviction that every act of compassion should be delivered with excellence.\n\nFrom early community relief work to structured national programmes, we have grown into a foundation committed to health, education, and spiritual uplift across Nigeria.',
    },
    mandateQuote: {
      quote:
        'Our faith inspires every act of compassion and every life we transform.',
    },
    leadership: {
      heading: 'Our Leadership',
      subtext:
        'A dedicated board guiding the foundation with faith, discipline, and operational excellence.',
    },
  },
  founder: {
    profile: {
      label: 'The Founder',
      name: 'Dr. Adebayo Ogunlesi',
      role: 'Founder & CEO',
      photoUrl:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=1500&fit=crop',
      intro:
        'A visionary philanthropist whose faith, discipline, and devotion to community excellence shaped the foundation’s mission to restore hope and dignity across Nigeria.',
    },
    article: {
      label: 'His Story',
      headline: 'A life devoted to service and excellence',
      body: 'Dr. Adebayo Ogunlesi founded Divine Gospel Delight Foundation with a clear conviction: humanitarian work should be marked by excellence, dignity, and lasting impact—not spectacle.\n\nRaised with a deep sense of faith and responsibility, he saw early how poverty and limited opportunity could steal delight from entire communities. That awareness became a calling.\n\nUnder his leadership, DGDF has pursued a standard of delivery rarely associated with charity—precise planning, accountable stewardship, and programs designed to help people move from surviving to thriving.',
    },
    quote: {
      quote:
        'Our mission transcends mere charity; it is a divine commitment to uplift the vulnerable and showcase the true spirit of African resilience through tangible impact.',
      attribution: 'Dr. Adebayo Ogunlesi',
    },
    cta: {
      headline: 'Continue the Work He Began',
      body: 'Support the programs and communities shaped by this vision—your partnership helps restore hope with excellence and dignity.',
      primaryLabel: 'Support Our Work',
      secondaryLabel: 'Back to About',
    },
  },
  gallery: {
    hero: {
      label: 'Our Visual Narrative',
      headline: 'Capturing the Heart of Every Outreach',
      body: 'A documentary-style journey through the communities we serve. These are the faces of hope, the hands of change, and the spirit of a community united in faith and service.',
    },
    testimonial: {
      quote:
        "The Divine Gospel Delight Foundation didn't just give us resources; they gave us hope. Our community has seen a transformation that only grace could bring.",
      name: 'Sister Ngozi Adeyemi',
      role: 'Community Leader, Lagos Outreach',
      photoUrl:
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    },
    cta: {
      headline: 'Be Part of the Next Chapter',
      body: 'Your support allows us to continue documenting and creating these stories of transformation. Every donation directly funds our next outreach.',
      primaryLabel: 'Donate Now',
      secondaryLabel: 'Join as Volunteer',
    },
  },
  donate: {
    hero: {
      headline: 'Your Generosity, Their Future.',
      subtext:
        'Every donation is a seed planted for sustainable change. Join our mission to provide dignity, education, and health to communities across Nigeria.',
    },
    impactStats: {
      peopleReached: 12402,
      outreaches: 45,
    },
    testimonial: {
      quote:
        'Supporting this foundation has been one of the most meaningful decisions I have made. You can see the dignity restored in every community they touch.',
      donorName: 'Chioma Adebayo',
      donorRole: 'Monthly Partner',
    },
  },
  contact: {
    hero: {
      headline: 'Connecting hearts to the mission of compassion.',
      subtext:
        'Whether you have a question about our programmes, wish to partner with us, or simply want to share a word of encouragement — we are here to listen.',
    },
    info: {
      phone: '+234 1 234 5678',
      email: 'info@dgdelightfound.org',
      address:
        '12 Prosperity Lane, Victoria Island Extension,\nLagos, Nigeria',
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
    tagline: 'Humanitarian Impact in Nigeria',
    logoUrl: '',
    logoPublicId: '',
  },
  contact: {
    phone: '+234 (0) 800 DELIGHT',
    email: 'info@dgdelightfound.org',
    address: '12 Corporate Way, Victoria Island, Lagos, Nigeria',
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
