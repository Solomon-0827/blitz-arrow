export const navs = [
  {
    title: 'dashboard',
    url: '/dashboard',
    icon: 'uil:dashboard',
  },
  {
    title: 'personal',
    groupIcon: 'uil:user-circle',
    items: [
      {
        title: 'profile',
        url: '/profile',
        icon: 'uil:user',
      },
    ],
  },
  {
    title: 'server',
    groupIcon: 'uil:server',
    items: [
      {
        url: '/subscribe',
        icon: 'uil:shop',
        title: 'subscribe',
      },
    ],
  },
  {
    title: 'finance',
    groupIcon: 'uil:dollar-sign',
    items: [
      {
        url: '/order',
        icon: 'uil:notes',
        title: 'order',
      },
      {
        url: '/wallet',
        icon: 'uil:wallet',
        title: 'wallet',
      },
      {
        url: '/affiliate',
        icon: 'uil:users-alt',
        title: 'affiliate',
      },
    ],
  },
  {
    title: 'help',
    groupIcon: 'uil:question-circle',
    items: [
      {
        url: '/document',
        icon: 'uil:book-alt',
        title: 'document',
      },
      {
        url: '/announcement',
        icon: 'uil:megaphone',
        title: 'announcement',
      },
      {
        url: '/ticket',
        icon: 'uil:message',
        title: 'ticket',
      },
    ],
  },
];

export function findNavByUrl(url: string) {
  for (const nav of navs) {
    if (nav.url && nav.url === url) {
      return [nav];
    }
    if (nav.items) {
      const current = nav.items.find((item) => item.url === url);
      if (current) {
        return [nav, current];
      }
    }
  }
  return [];
}

export const navItems = [
  {
    url: '/profile',
    icon: 'uil:user',
    title: 'profile',
  },
  {
    url: '/subscribe',
    icon: 'uil:shop',
    title: 'subscribe',
  },
  {
    url: '/order',
    icon: 'uil:notes',
    title: 'order',
  },
  {
    url: '/wallet',
    icon: 'uil:wallet',
    title: 'wallet',
  },
];
