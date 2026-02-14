import React, { type ReactNode, type ComponentType } from 'react';

type Provider = ComponentType<{ children: ReactNode }>;

interface ComposeProvidersProps {
  providers: Provider[];
  children: ReactNode;
}

export function ComposeProviders({ providers, children }: ComposeProvidersProps) {
  return providers.reduceRight<ReactNode>((acc, Provider) => <Provider>{acc}</Provider>, children);
}
