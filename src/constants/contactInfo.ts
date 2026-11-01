export interface SocialLink {
  name: string;
  url: string;
  handle: string;
  ariaLabel: string;
}

export interface CarneizContact {
  name: string;
  tagline: string;
  shortDescription: string;
  address: string;
  phone: string;
  formattedPhone: string;
  whatsappUrl: string;
  email: string;
  websiteUrl: string;
  websiteDisplay: string;
  logoUrl: string;
  rawLogoUrl: string;
  socials: {
    facebook: SocialLink;
    instagram: SocialLink;
    tiktok: SocialLink;
  };
}

export const CARNEIZ_CONTACT: CarneizContact = {
  name: "Carneiz Ltd",
  tagline: "Premium Butchery & Hand-Blended Spices",
  shortDescription:
    "Premium Nigerian butchery, offering clean farm-sourced meat cuts and premium hand-blended local spices directly to households.",
  address: "17 MCC/Uratta Road Ikenegbu, Owerri, Imo State",
  phone: "+2347075723880",
  formattedPhone: "+234 707 572 3880",
  whatsappUrl: "https://wa.me/2347075723880",
  email: "carniezltd@gmail.com",
  websiteUrl: "https://www.carneiz.org",
  websiteDisplay: "www.carneiz.org",
  logoUrl: "/assets/images/logo-circle.png",
  rawLogoUrl: "https://www.carneiz.org/assets/logo-Bjpc0DQl.png",
  socials: {
    facebook: {
      name: "Facebook",
      url: "https://web.facebook.com/people/Carneiz-Ltd/61572984234559/?locale=en_GB",
      handle: "@Carneiz-Ltd",
      ariaLabel: "Follow Carneiz Ltd on Facebook",
    },
    instagram: {
      name: "Instagram",
      url: "https://www.instagram.com/carneiz_meat_spices/",
      handle: "@carneiz_meat_spices",
      ariaLabel: "Follow Carneiz Meat & Spices on Instagram",
    },
    tiktok: {
      name: "TikTok",
      url: "https://www.tiktok.com/@carneiz?_t=ZN-8xC7kHxtdVW&_r=1",
      handle: "@carneiz",
      ariaLabel: "Follow Carneiz on TikTok",
    },
  },
};
