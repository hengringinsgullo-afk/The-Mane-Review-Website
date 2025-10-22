import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Target, 
  Heart, 
  Users, 
  BookOpen, 
  Shield, 
  Mail, 
  ExternalLink,
  Award,
  TrendingUp 
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-8">
        <h1 
          className="font-bold text-primary leading-none mb-6"
          style={{ fontFamily: 'var(--font-headline)', fontSize: '30px' }}
        >
          About The Mane Review
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Making markets approachable for anyone interested in investing, finance, and economic thinking.
        </p>
      </div>

      {/* What We Are */}
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-secondary" />
              <span>What We Are</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              The Mane Review is an educational financial publication created by students at 
              St. Paul's School. We bridge the gap between complex market analysis and accessible 
              investment education, providing thoughtful commentary on global markets, emerging 
              trends, and investment opportunities across major economies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As students passionate about finance and investing, our platform serves as both a 
              learning resource for those new to investing and a source of fresh perspectives for 
              experienced market participants. We cover markets in Brazil, the USA, Europe, and 
              Asia, offering regional insights and global context.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Badge className="bg-secondary text-secondary-foreground">Educational Content</Badge>
              <Badge variant="outline">Global Markets</Badge>
              <Badge variant="outline">Investment Analysis</Badge>
              <Badge variant="outline">Student Perspectives</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Why We Exist */}
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-secondary" />
              <span>Why We Exist</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Financial markets can seem intimidating and inaccessible to many people. We believe 
              that everyone should have the opportunity to understand how markets work, regardless 
              of their background or experience level.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to democratise financial education by providing clear, well-researched 
              content that makes complex topics understandable. We also champion young voices in 
              finance, giving student contributors a platform to share their insights and develop 
              their analytical skills.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-medium mb-2">Education First</h4>
                <p className="text-sm text-muted-foreground">Making finance accessible to all</p>
              </div>
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-medium mb-2">Youth Voices</h4>
                <p className="text-sm text-muted-foreground">Amplifying student perspectives</p>
              </div>
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-medium mb-2">Global Insight</h4>
                <p className="text-sm text-muted-foreground">Connecting world markets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Who We Are */}
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-secondary" />
              <span>Who We Are</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Henrique Gullo</h4>
                <Badge className="mb-3">Founder & Editor-in-Chief</Badge>
                <p className="text-muted-foreground leading-relaxed">
                  Henrique founded The Mane Review with a vision to make financial markets more 
                  accessible to everyone. With a passion for education and a deep understanding 
                  of global markets, he leads our editorial team in creating content that bridges 
                  the gap between academic finance and practical investing knowledge.
                </p>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Leo Gaz</h4>
                <Badge className="mb-3">Managing Editor</Badge>
                <p className="text-muted-foreground leading-relaxed">
                  Leo oversees the day-to-day editorial operations at The Mane Review, ensuring 
                  content quality and consistency across all publications. His experience gained 
                  through various internships provides valuable industry insights that help guide 
                  our editorial direction and mentor our team of contributors in delivering 
                  insightful and educational content to our readers.
                </p>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Eric Bartunek</h4>
                <Badge className="mb-3">Investment Club Founder</Badge>
                <p className="text-muted-foreground leading-relaxed">
                  Eric founded the Investment Club at St. Paul's School, creating a platform for 
                  students to learn about markets, share investment ideas, and develop practical 
                  financial skills. His leadership has fostered a vibrant community of young investors 
                  and helped establish The Mane Review's connection with student contributors, 
                  bringing fresh perspectives and enthusiasm to our publication.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Our Team</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Editorial Team</h5>
                  <p className="text-sm text-muted-foreground">
                    Experienced editors and market analysts who ensure content quality and accuracy.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Student Contributors</h5>
                  <p className="text-sm text-muted-foreground">
                    Talented students from St. Paul's School who bring fresh perspectives to financial analysis.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Investment Club</h5>
                  <p className="text-sm text-muted-foreground">
                    A dedicated group that curates our community watchlist and provides market insights.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Advisory Board</h5>
                  <p className="text-sm text-muted-foreground">
                    Industry professionals who guide our editorial standards and strategic direction.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Editorial Standards */}
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-secondary" />
              <span>Editorial Standards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              We maintain high editorial standards to ensure our content is accurate, balanced, 
              and educational. All articles undergo thorough fact-checking and editorial review 
              before publication.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h5 className="font-medium">Accuracy & Verification</h5>
                  <p className="text-sm text-muted-foreground">All facts and figures are verified through multiple sources</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h5 className="font-medium">Editorial Independence</h5>
                  <p className="text-sm text-muted-foreground">Our content is free from external influence and commercial bias</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h5 className="font-medium">Educational Focus</h5>
                  <p className="text-sm text-muted-foreground">All content serves an educational purpose and avoids speculation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h5 className="font-medium">Student Mentorship</h5>
                  <p className="text-sm text-muted-foreground">Student contributors receive guidance and editorial support</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Disclaimers */}
      <section className="space-y-10">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Important Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-amber-900 dark:text-amber-100">
            <div className="space-y-3">
              <p className="font-medium">Educational Content Only</p>
              <p className="text-sm">
                All content on The Mane Review is provided for educational and informational 
                purposes only. Nothing on this site should be considered as financial, investment, 
                or professional advice.
              </p>
            </div>
            
            <Separator className="bg-amber-200 dark:bg-amber-800" />
            
            <div className="space-y-3">
              <p className="font-medium">Not Financial Advice</p>
              <p className="text-sm">
                We do not provide personalised investment advice or recommendations. Always 
                consult with a qualified financial advisor before making investment decisions. 
                Past performance does not guarantee future results.
              </p>
            </div>
            
            <Separator className="bg-amber-200 dark:bg-amber-800" />
            
            <div className="space-y-3">
              <p className="font-medium">Market Data</p>
              <p className="text-sm">
                Market data and prices are provided for informational purposes and may be delayed. 
                We are not responsible for any trading decisions made based on this information.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-secondary" />
              <span>Contact Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              We'd love to hear from you. Whether you have questions, feedback, or ideas for 
              collaboration, don't hesitate to reach out.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium">General Enquiries</h5>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  contact@themanereviw.com
                </Button>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium">Editorial Submissions</h5>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Submit Article
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
