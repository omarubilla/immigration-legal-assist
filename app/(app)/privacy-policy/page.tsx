import type { Metadata } from "next";
import Link from "next/link";
import { getRobotsValue, isProteasomeSeoExperiment } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Sale | South Bay Bio",
  description:
    "Terms of Sale governing product purchases on South Bay Bio website.",
  robots: getRobotsValue(!isProteasomeSeoExperiment()),
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>{" "}
            / Privacy and Cookie Policy
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
            Privacy and Cookie Policy
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Last updated: March 17, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <article className="prose max-w-none prose-zinc dark:prose-invert prose-p:leading-7 prose-li:leading-7">
          <p>
            This privacy policy has been compiled to better serve those who are concerned with how their 'Personally identifiable information' (PII) is being used online. PII, as used in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.
          </p>

          <h2>What personal information do we collect from the people that visit our website?</h2>
          <p>
            When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, mailing address, phone number, credit card information, or other details to help you with your experience.
          </p>

          <h2>When do we collect information?</h2>
          <p>
            We collect information from you when you register on our site, place an order or enter information on our site.
          </p>

          <h2>
            How do we use your information?</h2>
          <p>
            We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:
            • To personalize user's experience and to allow us to deliver the type of content and product offerings in which you are most interested.
            • To quickly process your transactions.
          </p>

          <h2>How do we protect visitor information?</h2>
          <p>
            Our website is scanned on a regular basis for security holes and known vulnerabilities in order to make your visit to our site as safe as possible.
            Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.
            We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information.
            All transactions are processed through a gateway provider and are not stored or processed on our servers.
          </p>

          <h2>Do we use 'cookies'?</h2>
          <p>
            We do not use cookies for tracking purposes.
            You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser (like Internet Explorer) settings. Each browser is a little different, so look at your browser's Help menu to learn the correct way to modify your cookies.
            If you disable cookies off, some features will be disabled that make your site experience more efficient and some of our services will not function properly.
            However, you can still place orders.
          </p>

          <h2>Third Party Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.
            Third party links
            We do not include or offer third party products or services on our website.
          </p>

          <h2>Google</h2>
          <p>
            Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en
            We use Google AdSense Advertising on our website.
            Google, as a third party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
          </p>

          <h2>We have implemented the following:</h2>
          <p>
            • Demographics and Interests Reporting
            We along with third-party vendors, such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions, and other ad service functions as they relate to our website.
          </p>

          <h2>Opting out:</h2>
          <p>
            Users can set preferences for how Google advertises to you using the Google Ad Settings page. Alternatively, you can opt out by visiting the Network Advertising initiative opt out page or permanently using the Google Analytics Opt Out Browser add on.
          </p>

          <h2>California Online Privacy Protection Act</h2>
          <p>
            CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy. The law's reach stretches well beyond California to require a person or company in the United States (and conceivably the world) that operates websites collecting personally identifiable information from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals with whom it is being shared, and to comply with this policy. - See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf
          </p>

          <h2>11. 6-MONTH LIMITED WARRANTY ("Warranty")</h2>
          <p>
            In the event that you purchase a Product, South Bay Bio warrants to
            you that your Product will under normal use operate substantially in
            accordance with the accompanying documentation for a period of one
            6-months from date of original purchase. Your sole and exclusive
            remedy, and South Bay Bio's sole and exclusive responsibility under
            this warranty will be, at South Bay Bio's option, to replace the
            defective Product during the one 6-month limited warranty period so
            that it performs substantially in accordance with the accompanying
            documentation on the date of the initial purchase. Any replacement
            may be, at the option of South Bay Bio a new or remanufactured
            Product.
          </p>
          <p>
            The forgoing warranty is not applicable to: (i) defects or damage
            caused by misuse, accident (including without limitation; improper
            storage, fire, spillage), neglect, abuse, alteration, unusual
            stress, modification (ii) used not in accordance with the
            documentation
          </p>
          <p>
            To obtain warranty service for any Product that is subject to the
            foregoing warranty, all the following conditions must be met:
          </p>
          <p>
            An RMA must be requested from our customer service team within one
            6-months of your purchase date. To request an RMA, contact:
            https://south-bay-bio.com/products/sales/guest/form/
          </p>
          <p>Warranty and Remedy Terms &amp; Conditions:</p>
          <p>
            The limited warranty and remedy extends only to you and is not
            assignable or transferable to any subsequent purchaser or user.
          </p>
          <p>
            THE LIMITED WARRANTY AND REMEDY SET FORTH ABOVE IS PROVIDED IN LIEU
            OF ALL OTHER WARRANTIES AND REMEDIES AND South Bay Bio HEREBY
            DISCLAIMS ALL OTHER WARRANTIES AND REMEDIES OF ANY KIND, WHETHER
            EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, INCLUDING WITHOUT
            LIMITATION ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR USE OR PURPOSE, NON-INFRINGEMENT, QUALITY AND TITLE.
            South Bay Bio DOES NOT WARRANT THAT THE Product IS ERROR FREE OR
            THAT IT WILL FUNCTION WITHOUT INTERRUPTION.
          </p>
          <p>
            To the extent South Bay Bio may not, as a matter of applicable law,
            disclaim certain implied warranties and remedies, the duration of
            any such implied warranty and remedy shall be limited to the shorter
            of the one (1) year limited warranty period or the minimum time
            period permitted under such law. Some jurisdictions do not allow
            limitations on the duration of implied warranties and remedies, so
            the above limitation may not apply to you. This limited warranty and
            remedy gives you specific legal rights, and you may also have other
            rights that vary from jurisdictions to jurisdictions.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            (A) IN NO EVENT WILL South Bay Bio BE LIABLE FOR ANY SPECIAL,
            INDIRECT, INCIDENTAL, PUNITIVE OR CONSEQUENTIAL DAMAGES OF ANY
            NATURE WHATSOEVER INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS OR
            REVENUES, LOSS OF DATA, LOSS OF USE OF THE Product OR ANY ASSOCIATED
            EQUIPMENT, COST OF ANY REPLACEMENT GOODS OR SUBSTITUTE EQUIPMENT,
            LOSS OF USE DURING THE PERIOD THAT THE Product IS BEING REPAIRED,
            CLAIMS OF ANY THIRD PARTIES, OR ANY OTHER DAMAGES ARISING FROM South
            Bay Bio'S BREACH OF THIS AGREEMENT, INCLUDING THE LIMITED WARRANTY,
            OR THE USE OF THE Product, REGARDLESS OF THE FORM OF ACTION WHETHER
            IN CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL OR
            EQUITABLE THEORY, EVEN IF South Bay Bio HAS BEEN ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES. (B) IN NO EVENT WILL South Bay Bio'S
            TOTAL CUMULATIVE LIABILITY EXCEED THE PRICE PAID BY YOU FOR THE
            Product PURCHASED BY YOU.
          </p>
          <p>
            Some states do not allow the exclusion or limitation of incidental
            or consequential or other damages, so the above limitation or
            exclusion may not apply to you. If you have any questions concerning
            this statement of limited warranty please email South Bay Bio at:
            support@south-bay-bio.com.
          </p>

          <h2>13. Indemnification</h2>
          <p>
            Except to the extent a claim arises out of South Bay Bio's fraud or
            willful misconduct, you agree to defend, indemnify and hold harmless
            South Bay Bio, its members, affiliates, partners, and their
            officers, directors, partners, shareholders agents, licensees and
            employees (cumulatively "South Bay Bio Indemnitees") from and
            against all claims, actions, liabilities, losses, expenses, damages
            and costs, including but not limited to attorney's fees that may, at
            any time, arise from or relate to any Products purchased through our
            Website, including, without limitation, for any causes of action
            arising from your misuse of the Products.
          </p>

          <h2>14. Excuse of Performance</h2>
          <p>
            South Bay Bio shall not be liable for any failure or delay in
            performance due in whole or in part to any cause beyond the
            reasonable control of South Bay Bio or its contractors, agents or
            suppliers, including but not limited to utility or transmission
            failures, power failure, strikes or other labor disturbances, acts
            of God, acts of war or terror, floods, sabotage, fire, natural or
            other disasters.
          </p>

          <h2>15. Governing Law; Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of California,
            United States, without giving effect to its conflict of law rules,
            and you agree to the exclusive jurisdiction and venue of the federal
            and state courts located in Santa Clara County, California, United
            States, and waive any objection to such jurisdiction or venue. In
            the event of a dispute or controversy between South Bay Bio and you
            arising out of or in connection with your purchase, the parties
            shall attempt, promptly and in good faith, to resolve any such
            dispute. If we are unable to resolve any such dispute within a
            reasonable time (not to exceed thirty (30) days), then the parties
            shall be free to pursue any right or remedy available to them under
            applicable law. The application of the United Nations Convention on
            Contracts for the International Sale of Goods does not apply to
            these Terms.
          </p>

          <h2>16. Export Control</h2>
          <p>
            You may not use or otherwise export or re-export the Products
            purchased via the Website except as authorized by the laws of the
            jurisdiction in which the Products were obtained. In particular, but
            without limitation, the Products may not be exported or re-exported
            in violation of export laws, including if applicable export or
            re-export into any US-embargoed countries or to anyone on the US
            Treasury Department's list of Specially Designated Nationals or the
            US Department of Commerce Denied Person's List or Entity List. By
            using the Website, you represent that you are not located in any
            country or on any list where the provision of Product to you would
            violate applicable law. You also agree that you will not use
            Products for any purposes prohibited by applicable law.
          </p>

          <h2>17. General Provisions</h2>
          <p>
            These Terms constitute the entire agreement between the parties and
            supersedes all other communications between the parties relating to
            the subject matter of the Terms. The Terms may be amended, modified,
            or supplemented only in a writing signed by both parties. No waiver
            by either party of a breach hereof shall be deemed to constitute a
            continuing waiver of any other breach or default or of any other
            right or remedy, unless such waiver is expressed in writing signed
            by both parties. The rights that accrue to South Bay Bio by virtue
            of these Terms shall inure to the benefit of South Bay Bio's
            successors and assigns. Other terms may govern services purchased
            from South Bay Bio. Please contact us through any means listed below
            or review those terms as presented on the Website or as otherwise
            provided to you by South Bay Bio.
          </p>

          <h2>18. Notices</h2>
          <p>
            South Bay Bio may give you all notices (including legal process)
            that South Bay Bio is required to give by any lawful method,
            including by posting notice on the Website or by sending it to any
            email or mailing address that you provide to South Bay Bio. You
            agree to check for notices posted on the Website. You agree to send
            South Bay Bio any notice by mailing it toSouth Bay Bio's address for
            legal notices which is: South Bay Bio, LLC., 5941 Optical Court,
            Suite 229, San Jose, California 95138 Attention: Legal Dept.
          </p>

          <h2>19. How to Contact Us</h2>
          <p>
            If you have any questions about any Product or these Terms or would
            like to learn more about South Bay Bio, please write to us at South
            Bay Bio, LLC., 5941 Optical Court, Suite 229, San Jose, California
            95138, or email us at info@south-bay-bio.com, or call us at +1
            415-935-3226 (long distance charges may apply).
          </p>

          <p>
            <strong>Terms of Sale last updated: March 17, 2026.</strong>
          </p>
        </article>
      </section>
    </div>
  );
}