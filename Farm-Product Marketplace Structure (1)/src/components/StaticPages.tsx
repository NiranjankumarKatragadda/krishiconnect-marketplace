import { Card, CardContent } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Mail, Phone, MapPin, Users, Target, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

// About Us Page
export function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-4 text-center">About Us</h1>
          <p className="text-gray-600 text-center mb-12 text-xl">
            Connecting farmers with buyers across India
          </p>

          <Card className="mb-8">
            <CardContent className="pt-8">
              <h2 className="text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We are dedicated to revolutionizing agricultural commerce by creating a transparent, 
                efficient marketplace that connects farmers directly with buyers. Our platform eliminates 
                middlemen, ensuring fair prices and building sustainable relationships.
              </p>
              <p className="text-gray-600">
                By integrating government mandi rates and providing real-time market information, 
                we empower farmers to make informed decisions and maximize their income while helping 
                buyers source quality produce at competitive prices.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-8 text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  To become India's most trusted agricultural marketplace platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Our Community</h3>
                <p className="text-gray-600">
                  Supporting over 10,000+ farmers and buyers nationwide
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-8 text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Our Commitment</h3>
                <p className="text-gray-600">
                  Ensuring transparency, fairness, and quality in every transaction
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-8">
              <h2 className="text-gray-900 mb-6">Our Team</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-gray-900 mb-1">Rajesh Kumar</h3>
                  <p className="text-gray-600">Founder & CEO</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-gray-900 mb-1">Priya Sharma</h3>
                  <p className="text-gray-600">Head of Operations</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-gray-900 mb-1">Amit Patel</h3>
                  <p className="text-gray-600">Technology Lead</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// How It Works Page
export function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-4 text-center">How It Works</h1>
          <p className="text-gray-600 text-center mb-12 text-xl">
            Simple steps to buy or sell agricultural products
          </p>

          <div className="mb-12">
            <h2 className="text-gray-900 mb-6">For Suppliers (Farmers)</h2>
            <div className="space-y-6">
              {[
                { step: 1, title: 'Sign Up', desc: 'Create your supplier account with basic details' },
                { step: 2, title: 'Complete KYC', desc: 'Verify your identity for trusted transactions' },
                { step: 3, title: 'List Products', desc: 'Add your crops with quantity, price, and quality details' },
                { step: 4, title: 'Receive Inquiries', desc: 'Get messages from interested buyers' },
                { step: 5, title: 'Negotiate & Confirm', desc: 'Discuss terms and finalize the deal' },
                { step: 6, title: 'Deliver & Get Paid', desc: 'Ship the products and receive payment' },
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 mb-6">For Buyers</h2>
            <div className="space-y-6">
              {[
                { step: 1, title: 'Sign Up', desc: 'Create your buyer account' },
                { step: 2, title: 'Browse Market', desc: 'Search for products with filters' },
                { step: 3, title: 'Check Rates', desc: 'Compare with government mandi rates' },
                { step: 4, title: 'Send Inquiry', desc: 'Contact suppliers for your requirements' },
                { step: 5, title: 'Negotiate', desc: 'Discuss price, quantity, and delivery' },
                { step: 6, title: 'Place Order', desc: 'Confirm order and make payment' },
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ Page
export function FAQ() {
  const faqs = [
    {
      q: 'How do I register as a supplier?',
      a: 'Click on "Become a Supplier" and fill in your details including name, location, phone number, and business information. Complete KYC verification to start listing products.',
    },
    {
      q: 'Is there any commission fee?',
      a: 'Yes, we charge a small commission on successful transactions to maintain the platform and provide quality services.',
    },
    {
      q: 'How are prices determined?',
      a: 'Suppliers set their own prices based on quality, quantity, and market rates. We provide government mandi rates for reference.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We support bank transfers, UPI, and digital wallets. Escrow services are available for secure transactions.',
    },
    {
      q: 'How does the verification process work?',
      a: 'Submit your KYC documents including ID proof and address proof. Our team reviews within 24-48 hours.',
    },
    {
      q: 'What if I have a dispute?',
      a: 'Use our dispute resolution system to file a complaint. Our team will mediate and help resolve the issue fairly.',
    },
    {
      q: 'Can I track my orders?',
      a: 'Yes, both buyers and suppliers can track order status in their respective dashboards.',
    },
    {
      q: 'How do I contact support?',
      a: 'Use the Contact Us page or email us at support@farmmandi.com. We respond within 24 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-gray-900 mb-4 text-center">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-center mb-12">
            Find answers to common questions about our platform
          </p>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Contact Us Page
export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-4 text-center">Contact Us</h1>
          <p className="text-gray-600 text-center mb-12">
            Get in touch with us for any questions or support
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardContent className="pt-8">
                <h2 className="text-gray-900 mb-6">Get In Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">support@farmmandi.com</p>
                      <p className="text-gray-600">info@farmmandi.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+91 1800-123-4567 (Toll Free)</p>
                      <p className="text-gray-600">+91 98765-43210</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-gray-900 mb-1">Office Address</h3>
                      <p className="text-gray-600">
                        123 Agricultural Plaza<br />
                        Krishi Bhavan, New Delhi - 110001<br />
                        India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-gray-900 mb-3">Business Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>9:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Terms & Conditions
export function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-8 text-center">Terms & Conditions</h1>
          
          <Card>
            <CardContent className="pt-8 prose max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using this marketplace platform, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, please do not use this service.
              </p>

              <h2>2. User Registration</h2>
              <p className="text-gray-600">
                Users must provide accurate and complete information during registration. You are responsible for 
                maintaining the confidentiality of your account credentials.
              </p>

              <h2>3. Seller Obligations</h2>
              <p className="text-gray-600">
                Sellers must accurately describe products, maintain quality standards, and fulfill orders as promised. 
                False or misleading information may result in account suspension.
              </p>

              <h2>4. Buyer Responsibilities</h2>
              <p className="text-gray-600">
                Buyers must honor confirmed orders and make payments as agreed. Cancellations must follow 
                the platform's cancellation policy.
              </p>

              <h2>5. Commission and Fees</h2>
              <p className="text-gray-600">
                The platform charges a commission on successful transactions. Fee structure and payment terms 
                are clearly displayed during the transaction process.
              </p>

              <h2>6. Dispute Resolution</h2>
              <p className="text-gray-600">
                In case of disputes, users must first attempt to resolve issues through the platform's dispute 
                resolution system. The platform's decision in disputes will be final.
              </p>

              <h2>7. Prohibited Activities</h2>
              <p className="text-gray-600">
                Users must not engage in fraudulent activities, misrepresentation, harassment, or any illegal 
                activities on the platform.
              </p>

              <h2>8. Termination</h2>
              <p className="text-gray-600">
                The platform reserves the right to suspend or terminate accounts that violate these terms or 
                engage in inappropriate behavior.
              </p>

              <p className="text-gray-600 mt-8">
                Last updated: October 24, 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Privacy Policy
export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-8 text-center">Privacy Policy</h1>
          
          <Card>
            <CardContent className="pt-8 prose max-w-none">
              <h2>1. Information We Collect</h2>
              <p className="text-gray-600">
                We collect personal information including name, email, phone number, address, and business 
                details when you register on our platform. Transaction data and usage information is also collected.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p className="text-gray-600">
                Your information is used to facilitate transactions, improve our services, communicate updates, 
                and ensure platform security. We may use aggregated data for analytics.
              </p>

              <h2>3. Data Sharing</h2>
              <p className="text-gray-600">
                We share necessary information with transaction counterparties. We do not sell personal data 
                to third parties. Limited data may be shared with service providers under strict confidentiality agreements.
              </p>

              <h2>4. Data Security</h2>
              <p className="text-gray-600">
                We implement industry-standard security measures to protect your data. However, no method 
                of transmission over the internet is 100% secure.
              </p>

              <h2>5. Cookies and Tracking</h2>
              <p className="text-gray-600">
                We use cookies to enhance user experience and analyze platform usage. You can control cookie 
                preferences through your browser settings.
              </p>

              <h2>6. Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, correct, or delete your personal information. Contact us to 
                exercise these rights.
              </p>

              <h2>7. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this policy periodically. Users will be notified of significant changes.
              </p>

              <p className="text-gray-600 mt-8">
                Last updated: October 24, 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Refund & Dispute Policy
export function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-900 mb-8 text-center">Refund & Dispute Policy</h1>
          
          <Card>
            <CardContent className="pt-8 prose max-w-none">
              <h2>1. Cancellation Policy</h2>
              <p className="text-gray-600">
                Orders can be cancelled before shipping confirmation. After shipping, cancellation may incur 
                charges. Contact the seller immediately for cancellation requests.
              </p>

              <h2>2. Refund Eligibility</h2>
              <p className="text-gray-600">
                Refunds are available for: products not received, significantly different from description, 
                damaged/defective items, or cancelled orders before shipping.
              </p>

              <h2>3. Refund Process</h2>
              <p className="text-gray-600">
                Approved refunds are processed within 7-10 business days to the original payment method. 
                Shipping costs may not be refundable unless the issue is seller's fault.
              </p>

              <h2>4. Dispute Filing</h2>
              <p className="text-gray-600">
                If issues cannot be resolved with the seller, file a dispute through your dashboard within 
                15 days of order delivery. Provide detailed description and supporting evidence.
              </p>

              <h2>5. Dispute Resolution Process</h2>
              <p className="text-gray-600">
                Our team reviews all disputes within 3-5 business days. Both parties will be contacted for 
                their perspective. Decisions are based on platform policies and evidence provided.
              </p>

              <h2>6. Quality Issues</h2>
              <p className="text-gray-600">
                Report quality issues within 48 hours of delivery with photo/video evidence. The platform 
                may arrange quality inspection in cases of significant disputes.
              </p>

              <h2>7. Platform Guarantee</h2>
              <p className="text-gray-600">
                Transactions through our escrow system are protected. Funds are released to sellers only 
                after successful delivery or buyer confirmation.
              </p>

              <p className="text-gray-600 mt-8">
                For dispute resolution assistance, contact: disputes@farmmandi.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
