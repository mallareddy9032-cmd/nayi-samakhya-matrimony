import 'server-only';

export type NotificationChannel = 'whatsapp' | 'sms' | 'in_app';

export interface NotificationPayload {
  recipientPhone: string;
  recipientName?: string;
  eventType: 'interest_received' | 'interest_accepted' | 'contact_unlocked' | 'verification_completed';
  candidateName: string;
  candidateNsId: string;
  metadata?: Record<string, string | number>;
}

export interface DispatchResult {
  dispatched: boolean;
  channel: NotificationChannel;
  messageId: string;
  timestamp: string;
}

/**
 * Dispatches an automated transactional alert to the member.
 * Formats bilingual messages ready for WhatsApp Business API / SMS gateway (Twilio, Gupshup, Fast2SMS).
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<DispatchResult> {
  const timestamp = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let textTe = '';
  let textEn = '';

  switch (payload.eventType) {
    case 'interest_received':
      textTe = `నమస్కారం! నాయీ సమాఖ్యలో మీ ప్రొఫైల్‌కు ${payload.candidateName} (${payload.candidateNsId}) నుండి నూతన సంబంధం ఆసక్తి అభ్యర్థన వచ్చింది. చూడండి: https://nayisamakhya.org/matrimony/interests`;
      textEn = `Namaskaram! You received a new matrimonial match request from ${payload.candidateName} (${payload.candidateNsId}). View: https://nayisamakhya.org/matrimony/interests`;
      break;

    case 'interest_accepted':
      textTe = `శుభవార్త! ${payload.candidateName} మీ సంబంధం ఆసక్తిని ఆమోదించారు. సంప్రదింపు వివరాల కోసం చూడండి: https://nayisamakhya.org/matrimony/interests`;
      textEn = `Great news! ${payload.candidateName} accepted your match interest. Review details at: https://nayisamakhya.org/matrimony/interests`;
      break;

    case 'contact_unlocked':
      textTe = `పరస్పర సమ్మతి లభించింది! ${payload.candidateName} యొక్క కుటుంబ సంప్రదింపు నంబర్ మీ ఖాతాలో అన్‌లాక్ చేయబడింది. https://nayisamakhya.org/matrimony/interests`;
      textEn = `Mutual consent verified! Contact details for ${payload.candidateName} are now unlocked in your portal: https://nayisamakhya.org/matrimony/interests`;
      break;

    case 'verification_completed':
      textTe = `మీ నాయీ సమాఖ్య ప్రొఫైల్ విజయవంతంగా ధృవీకరించబడింది. సంబంధాలు వెతకడానికి సిద్ధంగా ఉంది: https://nayisamakhya.org/matrimony/discover`;
      textEn = `Your Nayi Samakhya matrimonial profile is verified and active. Discover matches at: https://nayisamakhya.org/matrimony/discover`;
      break;
  }

  // Log transactional dispatch event (webhook ready)
  console.info(JSON.stringify({
    event: 'transactional_notification_dispatched',
    messageId,
    phoneMasked: payload.recipientPhone.slice(0, 3) + '*****' + payload.recipientPhone.slice(-2),
    eventType: payload.eventType,
    previewTe: textTe.slice(0, 45) + '...',
    timestamp,
  }));

  // Production webhook hook: If WHATSAPP_WEBHOOK_URL or SMS_GATEWAY_URL is provided, post payload asynchronously
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || process.env.SMS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: payload.recipientPhone,
          messageTe: textTe,
          messageEn: textEn,
          eventType: payload.eventType,
          messageId,
        }),
      });
    } catch (err) {
      console.warn('Webhook notification dispatch failed:', err);
    }
  }

  return {
    dispatched: true,
    channel: process.env.WHATSAPP_WEBHOOK_URL ? 'whatsapp' : 'sms',
    messageId,
    timestamp,
  };
}
