import type { Metadata } from "next";
import Link from "next/link";
import { getRobotsValue, isProteasomeSeoExperiment } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Sale | South Bay Bio",
  description:
    "Terms of Sale governing product purchases on South Bay Bio website.",
  robots: getRobotsValue(!isProteasomeSeoExperiment()),
};

export default function TermsOfSalePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>{" "}
            / Terms of Sale
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
            Terms of Sale
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Last updated: March 16, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <article className="prose max-w-none prose-zinc dark:prose-invert prose-p:leading-7 prose-li:leading-7">
          <p>
            Please review these terms carefully, as these Terms of Sale (the
            "Terms") govern your purchases on our website and constitute a
            binding legal agreement between you and South Bay Bio, LLC., (herein
            also referred to as "South Bay Bio", "we" or "us"), the owner of
            the https://www.south-bay-bio.com website (the "Website"). By
            ordering Products, including Products manufactured by South Bay Bio
            or its agents ("Products"), through the Website, you signify your
            acceptance of these Terms. These Terms set out your rights and
            obligations with respect to your purchases, including important
            limitations and exclusions. All changes to these Terms are effective
            when posted on the Website. THESE TERMS CONTAIN LIMITATIONS ON
            LIABILITY; see Sections 11 - 13 for additional details.
          </p>

          <h2>1. Types of Sales</h2>
          <p>
            South Bay Bio accepts orders for Products through the Website. You
            may place your order on our Website at any time (subject to any
            planned or unplanned downtime). All Products ordered from the
            Website will be delivered to the U.S. Canadia, Europe, or Asia
            address you specify. You must pay for the Products online at the
            time you place the order. If you entered a valid address and your
            order and payment are accepted by us, your order will be shipped
            pursuant to the terms below. South Bay Bio will send a proof of
            purchase of the Products to the email address you provide. In
            addition, South Bay Bio will provide the proof of purchase
            information through the Website after the purchase transaction is
            complete, so that you may print the information at the time you
            complete the order if desired. If you have any questions regarding
            the ordering process, please contact South Bay Bio by any means
            listed in the How To Contact Us section below.
          </p>

          <h2>2. Prices and Taxes</h2>
          <p>
            Prices offered on the Website are quoted in U.S. Dollars. Such
            prices do not include sales taxes where applicable. You are
            responsible for any sales, use, excise, value added, or similar
            sales taxes, customs duties and brokerage fees that may apply to
            your order. If the amount you pay for an item is incorrect,
            regardless of whether it is an error in a price posted on this
            Website or otherwise communicated to you, then we reserve the right,
            at our sole discretion, to cancel your order, notify you through the
            contact information you provided during the order process, and refund
            to you the amount that you paid, regardless of how the error
            occurred.
          </p>

          <h2>3. Payment Methods</h2>
          <p>
            South Bay Bio allows you to make your purchases using any of the
            payment methods described below. Please read carefully our policies
            with respect to payment methods before you place your order. You may
            pay by credit, debit, or check card. When you provide South Bay Bio
            with your card information, and authorize the transaction, South Bay
            Bio will bill your credit card or process the transaction under your
            debit or check card you provided. Once your order has been accepted
            by the Website and the amount owed is authorized by the issuing bank
            of your card, South Bay Bio will send you confirmation to the email
            address you provided indicating that your order has been accepted
            ("Order Confirmation"). South Bay Bio accepts American Express,
            MasterCard, and Visa (subject to change without notice) with a
            billing address within the United States, Canada, Europe, or Asia.
            Debit cards and check cards have daily spending limits that may
            substantially delay the processing of your order. The Website
            requires the security code of your card for any online purchase to
            protect against the unauthorized use of your card by other persons.
            The security code is an individual three or four digit number
            specific to your card that may be printed on the face of your card
            above the embossed account number (if American Express), or on the
            back of your card, on the signature panel (if Visa or MasterCard).
            You represent and warrant that you have the right and are authorized
            to use the credit, debit or check card you present to purchase
            Products and that the billing and related information you provide is
            accurate and truthful. If for any reason you have not authorized
            charges to be made to your credit, debit or check card, or your
            credit, debit or check card issuer does not pay South Bay Bio for
            charges, South Bay Bio reserves the right to immediately suspend or
            terminate the fulfillment of your order. In addition to credit,
            debit, and check cards, you may use a Purchase Order (PO) number
            pending approval of your account, solely at the discretion of South
            Bay Bio. Once your order is confirmed you will receive an invoice by
            both email and regular mail, and agree to pay the balance-due within
            30-days of the invoice date.
          </p>

          <h2>4. Product Descriptions; All Sales Final</h2>
          <p>
            We attempt to describe and display the items offered on the Website
            as accurately as possible; however, we do not warrant that the
            descriptions or other content on the Website are accurate, complete,
            reliable, current or error-free.Unless you are provided with
            information to the contrary from us and subject to Product
            Warranties and our Guarantee stated below, all Product sales are
            final.
          </p>

          <h2>5. Payment Disputes</h2>
          <p>
            Subject to our Guarantee and Warranty stated below, if you dispute
            any charge for purchases of Products on the Website, you must notify
            South Bay Bio in writing within sixty (60) days of any such charge;
            failure to so notify South Bay Bio shall result in the waiver by you
            of any claim relating to such disputed charge; and charges shall be
            calculated solely based on records maintained by South Bay Bio.
          </p>

          <h2>6. Changes</h2>
          <p>
            In the event South Bay Bio agrees to a modification of a Product
            purchase transaction, South Bay Bio may revise prices, dates of
            delivery, and warranties with respect thereto.
          </p>

          <h2>7. Shipment and Delivery</h2>
          <p>
            You must pay for Product shipping costs to your designated locations
            within the ordering process prior to shipment of such Products.
            Accepted orders will be processed and Products will be shipped to
            valid physical addresses within the U.S.,Canada, Europe, and Asia.
            Exact shipping dates are unknown at the time you place the order and
            may exceed 3 days after your order is accepted. South Bay Bio will
            notify you if any order is estimated to take longer than 3 days to
            ship from the time the order is placed by you and accepted by South
            Bay Bio. In such circumstances, South Bay Bio will include in the
            notice your options as it relates to the order for Products that
            take longer than 3 days to ship. Products may be shipped by South
            Bay Bio or direct from one of our distributors. All claims of
            shortages or damages suffered in transit must be submitted directly
            to the South Bay Bio within the Guarantee period stated below. South
            Bay Bio reserves the right to make partial shipments. South Bay Bio
            is not bound to deliver any Products for which you have not provided
            shipping instructions, which include a valid email and phone number
            where you may be reached. Products may not be returned without the
            prior written consent of South Bay Bio through our RMA process
            stated below.
          </p>

          <h2>8. Inspection</h2>
          <p>
            Subject to the Warranty and Guarantee stated below,Products are
            accepted by you no later than the thirtieth (30th) day following
            delivery of Products unless the parties otherwise agree in writing;
            after acceptance is deemed completed, you waive any right to reject
            Products for nonconformity herewith.
          </p>

          <h2>9. Applicability of the Privacy Policy</h2>
          <p>
            You agree and understand that it is necessary for South Bay Bio to
            collect, process and use the information you submit to South Bay Bio
            in order to sell Products and confirm compliance with applicable
            laws in respect of your transaction. South Bay Bio will protect your
            information in accordance with its Privacy Policy located at
            south-bay-bio.com/Products/privacy-policy-cookie-restriction-mode/
            (the "Privacy Policy")
          </p>

          <h2>10. 30-DAY SATISFACTION GUARANTEE ("Guarantee")</h2>
          <p>
            If you are unsatisfied with your purchase from South Bay Bio for any
            reason, you have thirty (30) days from the date of purchase to
            request a refund.
          </p>
          <p>To qualify for a replacement or refund, all the following conditions must be met:</p>
          <ul>
            <li>
              A Return Merchandise Authorization ("RMA") must be requested from
              our customer service team within thirty (30) days of your purchase
              date. To request an RMA, go to:
              south-bay-bio.com/product/sales/guest/form/
            </li>
            <li>
              You must be willing to return any unused Product to South Bay Bio
              in it's original tube and packaging.
            </li>
            <li>
              If neither of above is available please contact customer support
              at: south-bay-bio.com/Products/contact/
            </li>
            <li>
              All accessories originally included with your Product must be
              included with your return.
            </li>
            <li>
              The Product must be shipped with a South Bay Bio 30-Day
              Satisfaction Guarantee RMA shipping label.
            </li>
          </ul>
          <p>
            South Bay Bio shall bear the cost of return shipping to South Bay
            Bio only if the Product is shipped with the 30-Day Satisfaction
            Guarantee RMA shipping label and only if one above required
            conditions are met.
          </p>
          <p>
            South Bay Bio will offer you one of the following options upon
            receipt and verification of returned Product:
          </p>
          <ul>
            <li>
              A replacement Product. South Bay Bio shall bear the cost of
              shipping a replacement Product to you.
            </li>
            <li>
              A refund for the original purchase price plus applicable taxes
              (minus original shipping &amp; handling costs). Refunds can only be
              credited to Visa, MasterCard or American Express credit/debit
              cards and only in US dollars. If a Purchase Order number was used
              to make payment, a refund will be issued by check.
            </li>
          </ul>
          <p>
            Guarantee Terms &amp; Conditions: Shipping and handling charges are not
            refundable unless South Bay Bio determines that: (1) the charges
            requested are legitimate and reasonable; and (2) the Product is
            inoperable and/or fails to operate substantially in accordance with
            the accompanying documentation through no fault of the original
            purchaser or through no fault of a third person, including the
            limitations and/or disqualifying actions expressed in the South Bay
            Bio 30-Day Satisfaction Guarantee.
          </p>
          <p>
            If you return Product to South Bay Bio (a) without an RMA request or
            (b) without all parts included in the original package or (c)
            without the South Bay Bio RMA shipping label or (d) with multiple
            Products in one return package; South Bay Bio retains the right to
            either refuse delivery of such return or refuse replacement or
            refund. Refunds will be processed and paid within two (2) weeks of
            South Bay Bio receipt and verification of return Product.
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
