import type { Photo } from '../../lib/match-store.ts';
import { Bi } from '../onboarding/Wizard.tsx';

/** Signed, short-lived URL from fn_photo_access(); the blurred variant is blurred server-side. */
export function PhotoFrame({ photo, name }: { photo: Photo; name: string }) {
  if (!photo) {
    return <div className="photo placeholder" aria-hidden="true"><span>{name.slice(0, 1)}</span></div>;
  }
  return (
    <figure className="photo">
      <img src={photo.url} alt={photo.variant === 'blurred' ? `Blurred photo of ${name}` : `Photo of ${name}`} loading="lazy" referrerPolicy="no-referrer" />
      {photo.variant === 'blurred' && (
        <figcaption><Bi en="Clear photo after mutual acceptance" te="పరస్పర అంగీకారం తర్వాత స్పష్టమైన ఫోటో" /></figcaption>
      )}
    </figure>
  );
}
