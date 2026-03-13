interface FieldErrorProps {
  errors: (string | undefined)[];
}

export function FieldError({ errors }: FieldErrorProps) {
  const first = errors.find(Boolean);
  if (!first) return null;
  return <p className="text-destructive text-xs mt-1">{first}</p>;
}
