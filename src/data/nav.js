export const sidebarNav = [
  {
    href: "/admin",
    icon: "mage:dashboard-2",
    label: "Dashboard",
    isStandalone: true,
  },
  {
    category: "Content Management",
    icon: "heroicons:document-text",
    items: [
      {
        href: "/admin/blogs",
        icon: "heroicons:document-text",
        label: "Blog Posts",
      },
      {
        href: "/admin/categories",
        icon: "heroicons:folder",
        label: "Categories",
      },
    ],
  },
  {
    category: "Settings",
    icon: "heroicons:cog-6-tooth",
    items: [
      {
        href: "/admin/settings",
        icon: "heroicons:cog-6-tooth",
        label: "Settings",
      },
    ],
  },
];
