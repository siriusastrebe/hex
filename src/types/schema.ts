// ----------------                       ----------------
// ---------------- Database schema types ----------------
// ----------------                       ----------------
export type unixtime = number;
export type uuid = string;
export type timestamptz = Date;
export type localized_time = string;
export type Timezone = 'America/Los_Angeles' | 'America/Denver' | 'America/Kentucky/Louisville' | 'America/Fort_Wayne' | 'America/Kentucky/Louisville' | 'America/Kentucky/Monticello' | 'America/North_Dakota/New_Salem' | 'America/North_Dakota/Center' | 'America/North_Dakota/Beulah' | 'America/Juneau' | 'America/Mexico_City' | 'America/Dawson_Creek' | 'America/Anchorage';
export type Timezone_Abbrev = 'PST' | 'PDT';

// ---------------- Logins ----------------
export type Login = {
  login_id: uuid;
  login_created: unixtime;
  login_public_id: uuid;
  banned: boolean;
}
export type Login_Password = {
  login_password_id: uuid;
  login_id: uuid;
  encrypted?: string;
  login_password_created: unixtime;
}
export type Login_Email = {
  login_email_id: uuid;
  login_id: uuid;
  email: string;
  login_email_created: unixtime;
}
export type Login_Phone = {
  login_phone_id: uuid;
  login_id: uuid;
  phone: string;
  login_phone_created: unixtime;
}
export type Login_Token = {
  login_token_id: uuid;
  login_id: uuid;
  token: string;
  login_token_created: unixtime;
  login_token_expires: unixtime;
  latest_password_entry: unixtime;
  last_refresh: unixtime;
  revoked: boolean;
}
export type Login_Permission = {
  login_permission_id: uuid;
  login_id: uuid;
  permission: string;
  login_permission_created: unixtime;
}
export type Login_History = {
  login_history_id: uuid;
  login_id: uuid;
  password_entered: unixtime;
  ip_address: string;
}

// ---------------- Locations ----------------
// Zip codes are not always unique to a state. They can cross state boundaries.
// One zip code can span multiple cities, and one city can have multiple zip codes.
// A zip code could be in multiple time zones. A state can have multiple time zones.
// https://www.thoughtco.com/states-split-into-two-time-zones-4072169
// https://peter-horton.com/2022/12/30/zip-codes-zctas-and-zctas-that-cross-state-boundaries/
// Cities in the United States do not cross state boundaries. Cities in other countries can cross state boundaries.

export type Address = {
  address_id: uuid;
  address: string;
  address_created: unixtime;
  city_id: uuid;
  zip_code_id: uuid;
  latitude?: number;
  longitude?: number;
  timezone: Timezone;
}
export type Zip_Code = {
  zip_code_id: uuid;
  zip_code_created: unixtime;
  zip_code: string; // Zip Codes should be unique for easy querying
}
export type City = {
  city_id: uuid;
  city_created: unixtime;
  city: string;
  state_id: uuid | undefined;
  country_id: uuid;
}
export type State = {
  state_id: uuid;
  state_created: unixtime;
  state: string;
  state_abbr: string;
}
export type Country = {
  country_id: uuid;
  country_created: unixtime;
  country: string;
  alpha_three: string; // 3 letter ISO standard country code
}

// ---------------- Restaurants ----------------
export type Restaurant = {
  restaurant_id: uuid;
  restaurant_created: unixtime;
  restaurant_name: string; // Rudy's pizza and pasta
  restaurant_name_short: string; // Rudy's
  restaurant_name_abbr: string; // RP&P
}

export type Restaurant_Location = {
  restaurant_location_id: uuid;
  restaurant_id: uuid;
  restaurant_location_created: unixtime;
  address_id: uuid;
  zip_code_id: uuid; // The zip code this restaurant location is administered from
}

export type Restaurant_Delivery_Zone = { // One restaurant location to many restaurant delivery zones
  restaurant_delivery_zone_id: uuid;
  restaurant_delivery_zone_created: unixtime;
  restaurant_location_id: uuid;
  zip_code_id: uuid;
  group?: string; // Null is the default group. Any zones for the same restaurant sharing the same group are considered the same zone.
  private: boolean;
}

export type Restaurant_Image = {
  restaurant_image_id: uuid;
  restaurant_id: uuid;
  restaurant_image_created: timestamptz;
}

export type Pickup_Time = {
  pickup_time_id: uuid;
  pickup_time_created: unixtime;
  pickup_time: unixtime;
  availability_id: uuid;
  restaurant_location_id: uuid;
}

export type Availability = {
  availability_id: uuid;
  availability_public_id: uuid;
  availability_created: unixtime;
  taking_orders: boolean;
  restaurant_location_id: uuid;
  restaurant_delivery_zone_group?: string;
  availability_start: timestamptz;
  availability_end: timestamptz;
  availability_timezone: Timezone;
  menu_id: uuid;
  start: localized_time;
  end: localized_time;
  abbrev: Timezone_Abbrev;
}

// ---------------- Menus ----------------
// A menu is a collection of menu items maintained by the admin in charge of the restaurant.
// Each pickup time has one menu associated with it, those items will be offered for purchase.
export type Menu = {
  menu_id: uuid;
  menu_public_id: uuid;
  menu_created: unixtime;
  menu_name: string;
  restaurant_id: uuid;
  deleted: unixtime;
}
export type Menu_Product = {
  menu_product_id: uuid;
  menu_product_created: unixtime;
  menu_product_price: number;
  menu_id: uuid;
  product_id: uuid;
  unavailable: boolean;
}
export type Product = {
  product_id: uuid;
  product_public_id: uuid;
  product_created: unixtime;
  restaurant_id: uuid;
  product_name: string;
  product_name_short: string;
  product_name_abbr: string;
  product_description?: string;
  product_price: number;
  restaurant_image_id?: string;
}
export type Variation = { // Variations are exclusive. You can only choose one in a group.
  variation_id: uuid;
  product_id: uuid;
  variation_created: unixtime;
  variation_name: string;
  variation_name_abbr: string;
  variation_description?: string;
  variation_image?: string;
  variation_price: number;
  variation_group_id: uuid;
  variation_public_id: uuid;
  variation_protein_preference?: uuid;
  variation_spicy_level?: number;
}
export type Variation_Group = { // Products can have many variation_groups. Each group has only one allowed selection
  variation_group_id: uuid;
  variation_group_required: boolean;
  variation_group_name?: string;
  variation_group_public_id: uuid;
  product_id: uuid;
}
export type Addon = { // Addons are optional. You can choose multiple.
  addon_id: uuid;
  addon_created: unixtime;
  product_id: uuid;
  addon_name: string;
  addon_name_abbr: string;
  addon_boolean: boolean;
  addon_price: number;
  addon_public_id: uuid;
}
export type Purchase = {
  purchase_id: uuid;
  purchase_created: uuid;
  purchase_created_by: uuid;
  total: number;
  total_quantity: number;
}
export type Delivery_Window = {
  delivery_window_id: uuid;
  delivery_window_start: timestamptz;  // Timezone is determined by the address
  delivery_window_end: timestamptz;
  address_id: uuid;
}
export type Purchase_Product = {
  purchase_product_id: uuid;
  purchase_id: uuid;
  product_id: uuid;
  delivery_window_id: uuid;
  sale_price: number;
  base_price: number; // Before addon and variation prices
  variations_price: number;
  availability_id: uuid;
  addons_price: number;
  customer_id: uuid;
}
export type Purchase_Variation = {
  purchase_variation_id: uuid;
  purcahse_product_id: uuid;
  purchase_variation_price: number;
}
export type Purchase_Addon = {
  product_addon_id: uuid;
  purchase_product_id: uuid;
  addon_price: number;
}

// ---------------- Admins ----------------
export type Admin_Zip_Code = {
  admin_zip_code_id: uuid;
  admin_zip_code_created: unixtime;
  zip_code_id: uuid;
  admin_id: uuid;
}


// ---------------- Meal Preferences ----------------
export type Dietary_Restriction = {
  dietary_restriction_id: uuid;
  dietary_restriction_public_id: uuid;
  dietary_restriction_created: unixtime;
  dietary_restriction_name: string;
  dietary_restriction_svg: string;
}
// We expect to see these in the database: 'Beef' | 'Chicken' | 'Pork' | 'Fish' | 'Tofu';
export type Protein_Preference = {
  protein_preference_id: uuid;
  protein_preference_public_id: uuid;
  protein_preference_name: uuid;
  protein_preference_svg: string;
}
export type Customer_Meal_Preference = {
  customer_meal_preference_id: uuid;
  customer_id: uuid;
  spicy_level: number; // Spice level is between 1-5
  variety: number; // Variety level is 1 for no variety, 5 for variety
}
export type Customer_Dietary_Restriction = { // One customer has many dietary restrictions
  customer_dietary_restriction_id: uuid;
  customer_meal_preference_id: uuid;
  dietary_restriction_id: uuid;
}
export type Customer_Protein_Preference = { // One has many protein preferences 
  customer_protein_preference_id: uuid;
  customer_meal_preference_id: uuid;
  protein_preference_id: uuid;
}

// ----------------              ----------------
// ---------------- Client Types ----------------
// ----------------              ----------------
// ---------------- Public types ----------------
export type Product_Public_Type = {
  product_public_id: uuid;
  product_name: string;
  product_name_short: string;
  product_name_abbr: string;
  product_description?: string;
  product_price: number;
  restaurant_image_id?: string;
  variation_groups: Variation_Group_Public_Type[];
  addons: Addon_Public_Type[];
}

export type Variation_Public_Type = {
  variation_name: string;
  variation_name_abbr: string;
  variation_price: number;
  variation_public_id: uuid;
};
export type Variation_Group_Public_Type = { 
  variation_group_name?: string;
  variation_group_required: boolean;
  variations: Variation_Public_Type[];
  variation_group_public_id: uuid;
};
export type Addon_Public_Type = {
  addon_name: string;
  addon_name_abbr: string;
  addon_boolean: boolean;
  addon_price: number;
  addon_public_id: uuid;
}
export type Menu_Public_Type = {
  menu_name: string;
  menu_public_id: uuid;
  deleted: unixtime;
  products: Product_Public_Type[];
  restaurant: Restaurant_Public_Type;
}
export type Availability_Public_Type = {
  start: localized_time;
  end: localized_time;
  taking_orders: boolean;
  menu_public_id: uuid;
  abbrev: Timezone_Abbrev;
  available_now: boolean;
  availability_public_id: uuid;
}
export type Availabilities_Public_Type = {
  availabilities: Availability_Public_Type[];
  menus: Menu_Public_Type[];
}
export type Restaurant_Public_Type = {
  restaurant_name: string;
  restaurant_name_short: string;
  restaurant_name_abbr: string;
  restaurant_locations?: Restaurant_Location_Public_Type[];
}
export type Restaurant_Location_Public_Type = {
  address: Address_Public_Type;
  restaurant_delivery_zones: Restaurant_Delivery_Zone_Public_Type[];
}
export type Restaurant_Delivery_Zone_Public_Type = {
  zip_code: string;
  group?: string;
  private: boolean;
}
export type Address_Public_Type = {
  address: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  timezone: Timezone;
}
export type Protein_Preference_Public_Type = {
  protein_preference_public_id: uuid;
  protein_preference_name: string;
  protein_preference_svg: string;
}
export type Dietary_Restriction_Public_Type = {
  dietary_restriction_public_id: uuid;
  dietary_restriction_name: string;
  dietary_restriction_svg: string;
}
export type Dietary_Choices_Type = {
  dietary_restrictions: Dietary_Restriction_Public_Type[];
  protein_options: Protein_Preference_Public_Type[];
}

// ---------------- Login ----------------
export type Login_Type = Login & { login_email?: Login_Email, login_passwords?: Login_Password[], login_phone?: Login_Phone, login_permissions: Login_Permission[], login_history?: Login_History[] };
export type Login_Token_Type = { login_public_id: uuid, refresh_token: string, expires: unixtime, access_token: string, email?: string, phone?: string, permissions: string[] };
export type Login_Response_Type = { success: boolean; login: Login_Token_Type; }
export type Access_Token_Public_Type = { login_public_id: uuid, expires: unixtime, emailOrPhone: string, permissions: string[], revoked: boolean };
export type Login_Token_Public_Type = { login_public_id: uuid, expires: unixtime, created: unixtime, latest_password_entry: unixtime, last_refresh: unixtime, revoked: boolean };
export type Login_Detailed_Type = Login_Type & { refresh_tokens: Login_Token_Public_Type[] };

// ---------------- Superuser ----------------
export type Superuser_Summary = {
  users: {
    count: number;
  }
}

export type Superuser_Users = {
  recently_logged_in: Login_Type[];
  recently_created: Login_Type[];
}

// ---------------- Admin ---------------- 
export type Admin_Editor_Privileges_Type = {
  zip_codes: Zip_Code[];
  restaurants: Restaurant_Type[];
}
export type Address_Type = Address & { city: City, state: State, country: Country, zip_code: Zip_Code };
export type Restaurant_Delivery_Zone_Type = Restaurant_Delivery_Zone & { zip_code: Zip_Code };
export type Restaurant_Location_Type = Restaurant_Location & { restaurant_delivery_zones: Restaurant_Delivery_Zone_Type[], address?: Address_Type };
export type Restaurant_Type = Restaurant & { restaurant_locations: Restaurant_Location_Type[] };
export type Variation_Group_Type = Variation_Group & { variations: Variation[] };
export type Product_Type = Product & { variation_groups: Variation_Group_Type[], addons: Addon[] };
export type Restaurant_Product_Type = Restaurant_Type & { products: Product_Type[] };
export type Menu_Products_Type = Menu_Product & Product_Type;
export type Menu_Type = Menu & { products: Menu_Products_Type[] };
export type Restaurant_Menu_Type = { menus: Menu_Type[], products: Product_Type[] };
export type Availabilities_Type = { availabilities: Availability[], menus: Menu_Type[], restaurant_delivery_zones: Restaurant_Delivery_Zone[] };

// uuid_generate_v1()
// extract(epoch from now()) * 1000
