import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

interface WaitlistSubmission {
  firstName: string;
  lastName: string;
  email: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { firstName, lastName, email } = req.body as WaitlistSubmission;

    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'firstName, lastName, and email are required'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Insert into Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    // Check if user already exists
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email is already on the waitlist'
      });
    }

    // Insert new waitlist entry
    const { data, error: insertError } = await supabase
      .from('waitlist')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          created_at: new Date().toISOString(),
          source: 'website',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);

      // Handle duplicate email error from database constraint
      if (insertError.code === '23505') {
        return res.status(409).json({
          error: 'Email already registered',
          message: 'This email is already on the waitlist'
        });
      }

      throw insertError;
    }

    // Send confirmation email via Resend
    try {
      await resend.emails.send({
        from: 'Stockbase <noreply@yourdomain.com>', // Update with your verified domain
        to: [email],
        subject: 'Welcome to Stockbase - You\'re on the List!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Stockbase</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f1315;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e2529; border: 1px solid rgba(212, 165, 116, 0.2); border-radius: 12px; overflow: hidden;">

                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(180deg, #2c353b 0%, #1e2529 100%);">
                          <h1 style="margin: 0; color: #d4a574; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Stockbase</h1>
                          <p style="margin: 8px 0 0; color: #f7f7f5; opacity: 0.6; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">The Operating System for Trades</p>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 16px; color: #f7f7f5; font-size: 24px; font-weight: 700;">You're on the list, ${firstName}.</h2>

                          <p style="margin: 0 0 24px; color: #f7f7f5; opacity: 0.8; font-size: 16px; line-height: 1.6;">
                            We've reserved your priority access to Stockbase. You're among the first to experience the future of inventory management for trade contractors.
                          </p>

                          <div style="background-color: rgba(212, 165, 116, 0.1); border-left: 3px solid #d4a574; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #d4a574; font-size: 14px; line-height: 1.6;">
                              <strong>What's Next?</strong><br>
                              Watch your inbox. We'll reach out with beta access details and exclusive updates.
                            </p>
                          </div>

                          <p style="margin: 24px 0 0; color: #f7f7f5; opacity: 0.6; font-size: 14px; line-height: 1.6;">
                            In the meantime, here's what Stockbase does:
                          </p>

                          <ul style="margin: 16px 0 0; padding: 0 0 0 20px; color: #f7f7f5; opacity: 0.8; font-size: 14px; line-height: 1.8;">
                            <li>Real-time inventory tracking across vans and warehouses</li>
                            <li>Deep integrations with Simpro, ServiceTitan, and AroFlo</li>
                            <li>Automated procurement and supplier management</li>
                            <li>Waste tracking (even copper pipe scraps)</li>
                          </ul>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; text-align: center; border-top: 1px solid rgba(247, 247, 245, 0.1);">
                          <p style="margin: 0; color: #f7f7f5; opacity: 0.4; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">
                            © ${new Date().getFullYear()} Stockbase Inc. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Email send error:', emailError);
      // Continue - user is still added to waitlist even if email fails
    }

    // Return success
    return res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        id: data.id,
        email: data.email
      }
    });

  } catch (error) {
    console.error('Waitlist submission error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process waitlist submission'
    });
  }
}
