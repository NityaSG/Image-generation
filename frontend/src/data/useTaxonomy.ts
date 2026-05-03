import { useEffect, useState } from "react";

import { fetchOptions } from "../api/client";
import type { OptionsResponse } from "../api/types";

interface TaxonomyState {
  data: OptionsResponse | null;
  loading: boolean;
  error: string | null;
}

let _cached: OptionsResponse | null = null;

export function useTaxonomy(): TaxonomyState {
  const [state, setState] = useState<TaxonomyState>({
    data: _cached,
    loading: !_cached,
    error: null,
  });

  useEffect(() => {
    if (_cached) return;
    let cancelled = false;
    fetchOptions()
      .then((data) => {
        _cached = data;
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
