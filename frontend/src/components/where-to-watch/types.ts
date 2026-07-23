export type Provider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type CountryData = {
  link?: string;
  flatrate?: Provider[];
  buy?: Provider[];
  rent?: Provider[];
};
