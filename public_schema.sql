--
-- PostgreSQL database dump
--

\restrict CRP9tCiQhicmw3BMcX4oPHFtRAdbcgsEy1tA8jX9hp38mrPIlnvtFtKYUx7MvVa

-- Dumped from database version 17.11
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
declare
  generated text;
begin
  loop
    generated := 'BP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (
      select 1
      from public.orders
      where order_number = generated
    );
  end loop;

  return generated;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    phone,
    full_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_profiles
    where user_profiles.user_id = auth.uid()
      and user_profiles.role = 'admin'
  );
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    product_slug text NOT NULL,
    product_title text NOT NULL,
    selected_dimension_id uuid,
    selected_dimension_label text NOT NULL,
    selected_frame text DEFAULT 'Unframed'::text NOT NULL,
    quantity integer NOT NULL,
    unit_amount numeric(10,2) NOT NULL,
    line_total numeric(10,2) NOT NULL,
    product_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT order_items_line_total_check CHECK ((line_total >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_amount_check CHECK ((unit_amount >= (0)::numeric))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text DEFAULT public.generate_order_number() NOT NULL,
    payment_provider text DEFAULT 'razorpay'::text NOT NULL,
    status text DEFAULT 'created'::text NOT NULL,
    payment_status text DEFAULT 'created'::text NOT NULL,
    currency_code text DEFAULT 'INR'::text NOT NULL,
    subtotal_amount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    delivery_method text DEFAULT 'standard'::text NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    shipping_address jsonb NOT NULL,
    notes jsonb DEFAULT '{}'::jsonb NOT NULL,
    razorpay_order_id text,
    razorpay_payment_id text,
    razorpay_signature text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid,
    CONSTRAINT orders_currency_code_check CHECK ((currency_code = ANY (ARRAY['INR'::text, 'USD'::text]))),
    CONSTRAINT orders_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['standard'::text, 'express'::text]))),
    CONSTRAINT orders_payment_provider_check CHECK ((payment_provider = 'razorpay'::text)),
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['created'::text, 'verified'::text, 'failed'::text, 'refunded'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['created'::text, 'payment_pending'::text, 'payment_authorized'::text, 'paid'::text, 'failed'::text, 'cancelled'::text, 'fulfilled'::text])))
);


--
-- Name: product_dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_dimensions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    width_cm numeric(8,2) NOT NULL,
    height_cm numeric(8,2) NOT NULL,
    unit text DEFAULT 'cm'::text NOT NULL,
    amount numeric(10,2) DEFAULT 200 NOT NULL,
    compare_at_amount numeric(10,2) DEFAULT 249,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_dimensions_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT product_dimensions_height_cm_check CHECK ((height_cm > (0)::numeric)),
    CONSTRAINT product_dimensions_unit_check CHECK ((unit = 'cm'::text)),
    CONSTRAINT product_dimensions_width_cm_check CHECK ((width_cm > (0)::numeric))
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    alt_text text,
    role text DEFAULT 'gallery'::text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_images_role_check CHECK ((role = ANY (ARRAY['primary'::text, 'gallery'::text])))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    collection text NOT NULL,
    currency_code text DEFAULT 'INR'::text NOT NULL,
    base_price numeric(10,2) DEFAULT 200 NOT NULL,
    compare_at_price numeric(10,2) DEFAULT 249,
    availability_status text DEFAULT 'in-stock'::text NOT NULL,
    available_for_sale boolean DEFAULT true NOT NULL,
    availability_label text DEFAULT 'In stock'::text NOT NULL,
    lead_time_label text DEFAULT 'Dispatches in 2 to 4 business days.'::text NOT NULL,
    badge text,
    badge_class_name text,
    material_summary text,
    features text[] DEFAULT '{}'::text[] NOT NULL,
    seo_title text,
    seo_description text,
    seo_canonical_path text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT products_availability_status_check CHECK ((availability_status = ANY (ARRAY['in-stock'::text, 'low-stock'::text, 'made-to-order'::text, 'sold-out'::text]))),
    CONSTRAINT products_base_price_check CHECK ((base_price >= (0)::numeric)),
    CONSTRAINT products_currency_code_check CHECK ((currency_code = ANY (ARRAY['INR'::text, 'USD'::text])))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL,
    email text,
    phone text,
    full_name text,
    avatar_url text,
    role text DEFAULT 'customer'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_profiles_role_check CHECK ((role = ANY (ARRAY['customer'::text, 'admin'::text])))
);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: collections collections_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_slug_key UNIQUE (slug);


--
-- Name: collections collections_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_title_key UNIQUE (title);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_razorpay_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_razorpay_order_id_key UNIQUE (razorpay_order_id);


--
-- Name: orders orders_razorpay_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_razorpay_payment_id_key UNIQUE (razorpay_payment_id);


--
-- Name: product_dimensions product_dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_dimensions
    ADD CONSTRAINT product_dimensions_pkey PRIMARY KEY (id);


--
-- Name: product_dimensions product_dimensions_product_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_dimensions
    ADD CONSTRAINT product_dimensions_product_id_code_key UNIQUE (product_id, code);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: collections_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX collections_active_idx ON public.collections USING btree (is_active);


--
-- Name: collections_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX collections_sort_order_idx ON public.collections USING btree (sort_order);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_customer_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_customer_email_idx ON public.orders USING btree (customer_email);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: product_dimensions_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_dimensions_product_id_idx ON public.product_dimensions USING btree (product_id);


--
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- Name: product_images_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_images_role_idx ON public.product_images USING btree (role);


--
-- Name: products_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_active_idx ON public.products USING btree (is_active);


--
-- Name: products_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_sort_order_idx ON public.products USING btree (sort_order);


--
-- Name: user_profiles_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_profiles_role_idx ON public.user_profiles USING btree (role);


--
-- Name: collections set_collections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: orders set_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: product_dimensions set_product_dimensions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_product_dimensions_updated_at BEFORE UPDATE ON public.product_dimensions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: product_images set_product_images_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_product_images_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products set_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_profiles set_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_selected_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_selected_dimension_id_fkey FOREIGN KEY (selected_dimension_id) REFERENCES public.product_dimensions(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: product_dimensions product_dimensions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_dimensions
    ADD CONSTRAINT product_dimensions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: collections Admins can manage collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage collections" ON public.collections TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: product_dimensions Admins can manage product dimensions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage product dimensions" ON public.product_dimensions TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: product_images Admins can manage product images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage product images" ON public.product_images TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.products TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: orders Admins can update orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: collections Public can read active collections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active collections" ON public.collections FOR SELECT TO authenticated, anon USING ((is_active = true));


--
-- Name: products Public can read active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active products" ON public.products FOR SELECT TO authenticated, anon USING ((is_active = true));


--
-- Name: product_dimensions Public can read dimensions for active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read dimensions for active products" ON public.product_dimensions FOR SELECT TO authenticated, anon USING ((EXISTS ( SELECT 1
   FROM public.products
  WHERE ((products.id = product_dimensions.product_id) AND (products.is_active = true)))));


--
-- Name: product_images Public can read images for active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read images for active products" ON public.product_images FOR SELECT TO authenticated, anon USING ((EXISTS ( SELECT 1
   FROM public.products
  WHERE ((products.id = product_images.product_id) AND (products.is_active = true)))));


--
-- Name: user_profiles Users can create own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: order_items Users can read own order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND ((orders.user_id = auth.uid()) OR public.is_admin())))));


--
-- Name: orders Users can read own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: user_profiles Users can read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR public.is_admin())) WITH CHECK (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: collections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: product_dimensions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_dimensions ENABLE ROW LEVEL SECURITY;

--
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict CRP9tCiQhicmw3BMcX4oPHFtRAdbcgsEy1tA8jX9hp38mrPIlnvtFtKYUx7MvVa

