import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { FileText, ArrowLeft } from "lucide-react";
import { getStoreKeyFromHost, getCustomDomainFromHost } from "@/lib/storeHost";
import StoreFooter from "@/components/store/StoreFooter";

export default function StoreCustomPage() {
  const { slug: slugParam, pageSlug } = useParams();
  const customDomain = getCustomDomainFromHost();
  const storeKey = getStoreKeyFromHost();
  const slug = slugParam || storeKey;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Link back to the store home — keep the /store/:slug prefix when not on a subdomain/custom domain.
  const storeHomePath = slugParam ? `/store/${slugParam}` : "/";

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.functions
      .invoke("getMarketplacePublic", { slug, customDomain })
      .then((res) => {
        if (!active) return;
        const mp = res.data?.marketplace;
        const page = (res.data?.customPages || []).find(p => p.slug === pageSlug);
        if (!mp || !page) setNotFound(true);
        else setData({ marketplace: mp, page });
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, customDomain, pageSlug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold">Page not found</h1>
        <Link to={storeHomePath} className="text-sm text-orange-400 hover:underline mt-2">← Back to store</Link>
      </div>
    );
  }

  const { marketplace, page } = data;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <Link to={storeHomePath} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
        <h1 className="text-3xl font-display font-extrabold mb-6">{page.title}</h1>
        <div className="prose prose-invert prose-sm max-w-none">
          {page.content ? <ReactMarkdown>{page.content}</ReactMarkdown> : <p className="text-muted-foreground">This page has no content yet.</p>}
        </div>
      </div>
      <StoreFooter marketplace={marketplace} footerText={marketplace.pageSections?.footerText} />
    </div>
  );
}