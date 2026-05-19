// src/app/privacy-policy/page.tsx
"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | Novelosity";
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <header className="text-center mb-12">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl sm:text-5xl font-headline text-primary mb-3">Novelosity Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
      </header>

      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-6 text-base leading-relaxed">
          <p>
            This Privacy Policy describes the data that we process to support Novelosity apps, websites, and related services offered by Novelosity (“Novelosity”). You can find additional tools and data in the Novelosity settings. It explains our practices concerning the personal data we collect from you, or that you provide to us, in connection with Novelosity. If you do not agree with this policy, you should not use Novelosity. Novelosity is provided and controlled by Renegade Hides LLC, with its registered address at 1360 S Finley Rd, Lombard, IL 60148. ("we" or "us"). If you have any questions about how we use your personal data, please contact <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a>.
          </p>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">1. Data Collection</h2>
            <p>
              The type of data that we collect and process is dependent on how you use Novelosity. For instance, the data we collect from the reader on Novelosity is not the same as that from the author who publishes the novel on Novelosity. Even if you don't have an account, if you use Novelosity, we'll be able to collect some data about you.
            </p>
            <p>The data we collect and process as follows:</p>

            <h3 className="text-xl font-semibold mt-4 mb-2">I. Your Operation and Data you provide</h3>
            <p>
              On Novelosity, you can read or publish novels, make comments, and purchase coins for charged chapters and so on. We will collect the operation that you may perform on Novelosity and the data you provide, such as:
            </p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>The content you create, for example novel or comments;</li>
              <li>The metadata about the content itself, for example upload address or creation documents date, in accordance with the relevant legislation;</li>
              <li>The type of content that you read or comment;</li>
              <li>The application and function you use, and your operation during this;</li>
              <li>The purchase or other transactions you do including the credit card data;</li>
              <li>The time, frequency, and duration of your operation.</li>
            </ul>

            <h4 className="text-lg font-semibold mt-3 mb-1">Data under special protection</h4>
            <p>
              You can choose to provide data about your age, gender, address, and email address. These and some other types of data may be specially protected under the laws of your jurisdiction.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">II. Application, Browser and Device Data</h3>
            <p>
              We will collect and receive data about the different devices you use and how you use these devices, and the data that comes from these devices.
            </p>
            <p>The device data that we collect and receive includes:</p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>The device and software that you currently use, and other device characteristics;</li>
              <li>The data that your device links to the Internet, including your IP address;</li>
              <li>The data that is collected by Cookie (specified in Section 2) and other similar techniques.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">III. Data that comes from Business Partner, Supplier and Third Party</h3>
            <p>
              We will collect various data and operations that you are on or out of Novelosity from business partners, suppliers and third parties. For example, we will collect your device data, your using application and the advertisement you view. Furthermore, a business partner will share with us some other data, such as your email, third-party account data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">2. Cookie</h2>
            <p>
              Cookies are small pieces of text used to store data on web browsers. Cookies are used to store and receive identifiers and other data on computers, phones and other devices. Other technologies, including data that we store on your web browser or device, identifiers associated with your device and other software, are used for similar purposes. In this policy, we refer to all of these technologies as "cookies".
            </p>
            <p>
              We use cookies if you have a Novelosity account, use Novelosity, including our website and apps, or visit other websites and apps that use Novelosity. Cookies enable Novelosity to offer Novelosity to you and to understand the data that we receive about you, including data about your use of other websites and apps, whether you are registered or logged in or not.
            </p>
            <p>We use cookies to:</p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>Verify log-in data.</li>
              <li>Track traffic flow and patterns of travel in connection with the Services.</li>
              <li>Understand the total number of visitors to the Services on an ongoing basis and the types of devices.</li>
              <li>Monitor the performance of the Services and continually improve it.</li>
              <li>Customize and enhance your online experience.</li>
              <li>Provide customer service.</li>
            </ul>
            <p>
              You have the right to choose whether to accept cookies or not. However, please note that if you choose to refuse cookies, certain parts of Novelosity may not work properly if you have disabled browser cookie use. Please be aware that these controls are distinct from the controls that Novelosity offers you.
            </p>
            <p>
              Most devices (in the case of mobile applications) and browsers (in the case of web apps and pages) are initially set up to accept cookies and allow you to change your cookie settings. These settings will typically be found in your browser’s “options” or “preferences” menu. You can reset your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">3. The Ways and Purpose of Data Processing</h2>
            <p>
              The types of data we process and the purposes and ways we process it are as follows:
            </p>
            <p>
              The purpose and ways that we process your data for and by the type of data we use (specified in Section 1).
            </p>
            <p>
              The actual data we use will depend on your actual situation, but may include the following data:
            </p>
            <p>
              Providing Novelosity involves collecting, storing, sharing, analyzing, reviewing, and collating data when necessary, and in some cases using not only automated processing techniques but also a manual review process to accomplish the following purposes:
            </p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>Creating and maintaining your account and personal homepage;</li>
              <li>Promoting content presenting;</li>
              <li>Providing the comments function;</li>
              <li>Offering the commercial novels; and</li>
              <li>Carrying out an analysis.</li>
            </ul>
            <p>
              We also use the available data to develop, study, and test Novelosity improvement. The data we have is used for the following purposes:
            </p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>Knowing if Novelosity is working properly;</li>
              <li>Solving issues and correcting exceptions;</li>
              <li>Testing new features;</li>
              <li>Acquiring feedback for Novelosity or functions.</li>
            </ul>
            
            <h4 className="text-lg font-semibold mt-3 mb-1">Your Operation and Data you provide</h4>
             <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The content you create, for example novel or comments;</li>
                <li>The metadata about the content itself, for example upload address or creation documents date, in accordance with the relevant legislation;</li>
                <li>The type of content that you read or comment;</li>
                <li>The application and function you use, and your operation during this;</li>
                <li>The purchase or other transactions you do including the credit card data;</li>
                <li>The time, frequency, and duration of your operation.</li>
            </ul>

            <h4 className="text-lg font-semibold mt-3 mb-1">Application, Browser and Device Data</h4>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The device and software that you currently use, and other device characteristics;</li>
                <li>The data that your device links to the Internet, including your IP address;</li>
                <li>The data that is collected by Cookie (specified in Section 2) and other similar techniques.</li>
            </ul>
            
            <h4 className="text-lg font-semibold mt-3 mb-1">Data that comes from Business Partner, Supplier and Third Party</h4>
            <p>(You can control Novelosity’s action to use the business partner data to make a personalizing advertisement.)</p>

            <p className="mt-4">
              We will process your relative data we control and use an automated processing technique, in some cases take a manual review process to accomplish the following purposes:
            </p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>Verifying accounts and operations;</li>
              <li>Investigating suspicious activity;</li>
              <li>Anti-piracy operation;</li>
              <li>Detecting, preventing and combating harmful or illegal activities;</li>
              <li>Monitoring and preventing spam, as well as other security issues and bad experiences.</li>
            </ul>
            <p>
              Processing your data that is specifically protected by the law, so that we can share it with others you permit, in order to better serve you. For this purpose, we collect, store, and publish data, and process it automatically or in some cases by hand.
            </p>
            
            <h4 className="text-lg font-semibold mt-3 mb-1">Your Operation and Data you provide</h4>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The data about your age, gender, address, and email address which may be specially protected under the laws of your jurisdiction and be provided by you when you register a Novelosity account.</li>
            </ul>

            <p className="mt-4">
              Transfer, store, or process your data across borders, including with the United States and other countries. Because Novelosity operates on a global scale, with our users, partners, suppliers and employees all over the world, it is necessary for us to communicate data for the purpose of maintaining, analysis and improvement of Novelosity.
            </p>
            
            <h4 className="text-lg font-semibold mt-3 mb-1">Your Operation and Data you provide</h4>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The content you create, for example novel or comments;</li>
                <li>The metadata about the content itself, for example upload address or creation documents date, in accordance with the relevant legislation;</li>
                <li>The type of content that you read or comment;</li>
                <li>The application and function you use, and your operation during this;</li>
                <li>The purchase or other transactions you do including the credit card data;</li>
                <li>The time, frequency, and duration of your operation.</li>
            </ul>

            <h4 className="text-lg font-semibold mt-3 mb-1">Application, Browser and Device Data</h4>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The device and software that you currently use, and other device characteristics;</li>
                <li>The data that your device links to the Internet, including your IP address;</li>
                <li>The data that is collected by Cookie (specified in Section 2) and other similar techniques.</li>
            </ul>
            <p>Data that comes from Business Partner, Supplier and Third Party</p>
            <p>
              Share your contact details, personal data, or other data with a third party. The type of data you want to share will be different according to what you require us to share. For example:
            </p>
            <p>
              When you instruct us to pay your proceeds by PayPal, we will share your PayPal account data or other data you may allow in order to be able to pay successfully.
            </p>
            <h4 className="text-lg font-semibold mt-3 mb-1">Your Operation and Data you provide</h4>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
                <li>The content you create, for example your name, bank account number, email, address and so on.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">4. Data Sharing</h2>
            <p>
              We will never sell any of your data to anyone, and we require partners and third parties to follow the rules that define how they are allowed and prohibited from using and disclosing the data we provide.
            </p>
            <p>Specifically, we share data with the following third parties:</p>
            <ul className="list-[lower-alpha] list-inside pl-4 my-2 space-y-1">
              <li>We work with third-party partners who help us improve Novelosity, which makes it possible to operate our companies and provide services to people around the world.</li>
              <li>We do not provide any personally identifiable data</li>
              <li>to these third-party ad servers or ad networks without your consent or except as part of a specific program or feature for which you will have the ability to opt-in or opt-out.</li>
              <li>Members, subsidiaries, or affiliates of our corporate group, make Novelosity improving and optimizing.</li>
              <li>Law enforcement agencies, public or tax authorities or other organizations if legally required to do so.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">5. Data Security</h2>
            <p>
              We take reasonable and appropriate technical and organizational measures to help protect personal data from unauthorized access, use, disclosure, alteration, and destruction. Unfortunately, the transmission of data via the internet is not completely secure and we cannot guarantee the security of your data transmitted via the Platform; any transmission is at your own risk. To help us protect personal data, we request that you use a strong password and never share your password with anyone or use the same password with other sites or accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">6. Data Management or Deleting and Your Rights Exercising</h2>
            <p>
              We provide the following tools for viewing, managing, downloading, and deleting your own personal data. You can also visit the Settings page of the product you are using to manage personal data. In addition, you may have other privacy rights under applicable law.
            </p>
            <p>
              You can use Personal Center, or open the client, click "My" - "Contact Customer Service", and then contact the customer service by email <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a> to exercise your rights.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">I. View and manage your personal data</h3>
            <p>
              You are entitled to access, view and manage your personal data via Personal Center, or open the client, click "My" - "Contact Customer Service", and then contact the customer service by email <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a>.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">II. Delete your personal data or your account</h3>
            <p>If you want to remove your personal data, you can:</p>
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              <li>
                Search for and remove certain personal data
                <p className="pl-4">
                  We have provided you with a series of tools that will help you delete certain personal data. For example, you can use the Delete button to remove books from the shelf. You can remove the comments by clicking the Delete button. Once the comments are removed, other users will not be able to see them anymore.
                </p>
              </li>
              <li>
                Remove your account permanently
                <p className="pl-4">
                  You can contact us by e-mail at <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a> to ask for your account to be removed.
                </p>
                <p className="pl-4">
                  Once your account is removed, we will no longer supply you with any products or services. We will remove your personal data at your request, except as otherwise required by the law.
                </p>
                <p className="pl-4">
                  We will help you to remove your account data and delete your payment records for unlock chapters. If you permanently remove your account, you cannot reactivate it, and you cannot retrieve your reading, spending, or unlocking records, including the balance of your top-up voucher.
                </p>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">III. How long does it take to delete your personal data?</h3>
            <p>
              The time required for deletion varies; for example, deleting your personal data is instantaneous and will be removed immediately. Deleting the account must not last more than 15 days from the date of receipt of the request. If you do not like it, please contact the customer service department and complain.
            </p>
            <p>
              You can use Personal Center to view your personal data or click "My" - "Contact Customer Service". You can inquire, correct, delete, cancel user account, and revoke authorized user's operation by contacting client. For safety reasons, you might want to submit a written request. Or some other way to prove your identity. You may be required to confirm your identity before you proceed with your application.
            </p>
            <p>
              A reply will be sent to you within 15 working days. If you don't like it, feel free to contact customer service to complain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">7. Age Restrictions</h2>
            <p>
              Novelosity is not developed for children. This Platform is not directed at children under the age of 12 or equivalent minimum age in the relevant jurisdiction. If you believe that we have personal data about or collected from a child under the relevant age, please contact us at <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a>.
            </p>
            <p>
              Users between 12 and 18 (each a “Teen”) may not access or use the Service unless (i) both the Teen and their parent or legal guardian have first agreed to these Terms of Service; and (ii) the Teen uses an account established by their parent or legal guardian, under such parent or guardian’s supervision, and with such parent or guardian’s permission. If you permit a Teen to use the Services, you hereby agree to these Terms of Service on behalf of both yourself and the Teen. You further agree that you are solely responsible for any and all use of the Service by your Teen regardless of whether such use was authorized by you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">8. Data Retention Time</h2>
            <p>
              We retain your data for as long as it is necessary to provide you with the service or fulfill the transactions you have requested or authorized. Where we do not need your data in order to provide the service to you, we retain it only for so long as we have a legitimate business purpose in keeping such data, including to comply with our legal obligations, enforce our agreements, resolve disputes, and as necessary for the establishment, exercise or defense of legal claims.
            </p>
            <p>
              You can delete your Account, and you should understand that upon deletion of your Account, you will lose the right to access or use all or part of the Platform. After you have deleted your account, we may retain certain data in an aggregated and anonymized format.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">9. Changes of this policy</h2>
            <p>
              We'll notify you before we make changes to this policy and give you the opportunity to review the revised policy before you choose to continue using our Products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">10. Complaints</h2>
            <p>
              In the event that you wish to make a complaint about how we process your personal data, please submit your complaint via email at <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a>. We will endeavor to deal with your request as soon as possible. This is without prejudice to your right to launch a claim with your data protection authority or follow the dispute resolution process provided in the Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline mt-8 mb-4 text-primary">11. Contact</h2>
            <p>If you have questions about this policy, you can contact us as described below.</p>
            <h3 className="text-xl font-semibold mt-4 mb-2">Contact Us</h3>
            <p>You can contact us by email or by mail at:</p>
            <p>
              <a href="mailto:contact@novelosity.com" className="text-primary hover:underline">contact@novelosity.com</a>
            </p>
            <address className="mt-2 not-italic">
              Renegade Hides LLC<br />
              1360 S Finley Rd, Lombard, IL 60148<br />
              +1 7252177745
            </address>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

    