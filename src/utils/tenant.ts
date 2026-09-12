export function getTenantNameFromEmail(email?: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'Your Company';
  }
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return 'Your Company';

  // Recognized corporate domains
  const domainMap: Record<string, string> = {
    'acmecorp.com': 'Acme Corp',
    'acme.com': 'Acme Corp',
    'globex.com': 'Globex Inc',
    'globexcorp.com': 'Globex Inc',
    'initech.com': 'Initech',
    'umbrella.com': 'Umbrella Corp',
    'wayne.com': 'Wayne Enterprises',
    'stark.com': 'Stark Industries',
    'hooli.com': 'Hooli',
  };

  if (domainMap[domain]) {
    return domainMap[domain];
  }

  // Common consumer/personal webmail providers: map to primary tenant or fallback
  const publicMailProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'proton.me', 'protonmail.com', 'aol.com',
  ];
  if (publicMailProviders.includes(domain)) {
    return 'Acme Corp';
  }

  // Dynamic extraction from custom enterprise domain
  const prefix = domain.split('.')[0] || '';
  if (!prefix) return 'Your Company';

  if (prefix.toLowerCase().endsWith('corp')) {
    const main = prefix.slice(0, -4);
    return (main ? main.charAt(0).toUpperCase() + main.slice(1) + ' ' : '') + 'Corp';
  }
  if (prefix.toLowerCase().endsWith('inc')) {
    const main = prefix.slice(0, -3);
    return (main ? main.charAt(0).toUpperCase() + main.slice(1) + ' ' : '') + 'Inc';
  }

  return prefix
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
