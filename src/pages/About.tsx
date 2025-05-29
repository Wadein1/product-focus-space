
import Navbar from "@/components/Navbar";
import { Users, Target, BookOpen, Award, Clock, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About Gimme Drip
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Creating premium custom medallions that help teams celebrate their achievements with style and pride.
            </p>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-16">
            {/* Brand Promise */}
            <section className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Brand Promise</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                We deliver high-quality, customizable medallions with precision craftsmanship and timely service, 
                so you can represent your team with confidence.
              </p>
            </section>

            {/* Our Goal */}
            <section className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Goal</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                We aim to give every youth sports team the opportunity to experience how colleges and big league teams 
                celebrate through custom chain medallions that wouldn't usually be accessible due to the lack of small 
                batch custom product technologies.
              </p>
            </section>

            {/* Our Story */}
            <section className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                I'm a high-schooler who, with my dad's help, turned several different iterations of different product 
                ideas into medallion chains for teams and clubs. Upload your logo, pick your finish, and we handle 
                production, quality control, and shipping—no hidden fees, no headaches.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                The result? Premium chains that showcase your style and support your cause.
              </p>
            </section>

            {/* Why Choose Us */}
            <section className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Team-Focused</h3>
                    <p className="text-gray-700">
                      We understand the importance of team unity and pride. Our medallions help create lasting memories and strengthen team bonds.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Turnaround</h3>
                    <p className="text-gray-700">
                      Quick production times mean you can celebrate your achievements when they matter most, not weeks later.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center bg-primary rounded-lg p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Your Custom Medallions?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join hundreds of teams who trust us to create their celebration medallions.
              </p>
              <a 
                href="/product" 
                className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Customizing
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
