import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Target, Heart, Users, BookOpen, Shield, Mail, Award, TrendingUp } from 'lucide-react';

interface AboutPageProps { onNavigate: (page: string, data?: any) => void; }

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <div className="text-center space-y-8"><h1 className="font-bold text-primary leading-none mb-6" style={{ fontFamily: 'var(--font-headline)', fontSize: '30px' }}>About The Mane Review</h1><p className="text-muted-foreground max-w-2xl mx-auto">Making markets approachable for anyone interested in investing, finance, and economic thinking.</p></div>
      <section className="space-y-10"><Card><CardHeader><CardTitle className="flex items-center space-x-2"><Target className="h-6 w-6 text-secondary" /><span>What We Are</span></CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground leading-relaxed">The Mane Review is an educational financial publication created by students. We bridge the gap between complex market analysis and accessible investment education, providing thoughtful commentary on global markets, emerging trends, and investment opportunities across major economies.</p><p className="text-muted-foreground leading-relaxed">As students passionate about finance and investing, our platform serves as both a learning resource for those new to investing and a source of fresh perspectives for experienced market participants. We cover markets in Brazil, the USA, Europe, and Asia, offering regional insights and global context.</p><div className="flex flex-wrap gap-3 mt-6"><Badge className="bg-secondary text-secondary-foreground">Educational Content</Badge><Badge variant="outline">Global Markets</Badge><Badge variant="outline">Investment Analysis</Badge><Badge variant="outline">Student Perspectives</Badge></div></CardContent></Card></section>
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-secondary" />
              <span>Why We Started The Mane Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground leading-relaxed mb-6">
                We started The Mane Review because it became too evident how little people seemed to understand economics and how it affects their daily lives. Whenever a topic like inflation, unemployment, or government budgets came up, people would either change the subject or repeat something they'd heard online but hadn't clearly understood, which was even clearer when you asked them a follow-up.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                We saw this not as a lack of intelligence or interest, but as a lack of access; our peers didn't know where to start. Economics felt surreal, restricted to professionals and theory in the IB. However, it was evident to everyone that it shaped everything around us—from the cost of groceries to the opportunities we could pursue.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                The more we talked about it, the more we realized that economic illiteracy was everywhere. Friends didn't understand what interest rates actually meant for their families. Classmates could tell us what GDP is, but not comment on Brazil's. We realized people wanted to understand, but most sources were too technical or political. We knew something had to be done.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                We didn't want to create another generic school newspaper that just summarized headlines, though. Our idea revolved around something that explained economics clearly and fairly, connecting theory to real life.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                That idea eventually became The Mane Review. Students were finally allowed to enter a world where they could understand the financial decisions that now matter more than ever. At first, we weren't sure where to begin. None of us were journalists or economists. But what started as curiosity led to a newfound sense of responsibility. We started by picking one topic at a time and researching it deeply. Every article was written with the same goal—to make readers think, "Oh, that's why/how it works."
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Through The Mane Review, we also learned about responsibility in journalism. We had to verify every statistic, check multiple sources, and avoid sensationalism. We saw how easy it was for economic topics to become politicized, and we consciously decided to focus on facts and explanations, veering away from pure opinion. Said discipline led to trust. Readers knew that even if they disagreed with an interpretation, they could rely on our reporting to be accurate and fair.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                We also discovered how economics connects to everything else—politics, education, healthcare, technology, and even climate change. Understanding one helped explain the other. That's why our coverage gradually expanded beyond pure financial topics to include broader economic implications. We wanted to show that economics isn't just about money—about choices, priorities, and systems that shape society.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Looking back, starting The Mane Review taught us as much as it taught our readers. We learned how to work together, manage deadlines, edit constructively, and present information in a way that informs rather than overwhelms. We also learned that curiosity is contagious. Once people understand how the economy works, they want to know more and question what they read elsewhere. Every article we publish is one small step toward a more informed community, where people can make better decisions for themselves and others.
              </p>

              <p className="text-muted-foreground leading-relaxed font-medium">
                Economics shouldn't be a mystery. It should be a common language that helps people understand the world. That's what The Mane Review stands for, and that's why we started it.
              </p>
            </div>

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
      <section className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-secondary" />
              <span>Who We Are</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Leadership */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Leadership</h4>
              <div className="grid gap-6">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2">Henrique Gullo</h4>
                  <Badge className="mb-3">Founder and Executive Director</Badge>
                  <p className="text-muted-foreground leading-relaxed">
                    Henrique is responsible for guiding the strategic vision and overall direction of The Mane Review. His role encompasses leading the editorial process, driving website development, and shaping the platform's future. While he provides leadership, he believes deeply in the power of teamwork and recognizes that The Mane Review's success is built on collective effort.
                  </p>
                </div>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2">Leo Gaz</h4>
                  <Badge className="mb-3">Founder and Director</Badge>
                  <p className="text-muted-foreground leading-relaxed">
                    Leo is responsible for ensuring efficient operation of The Mane Review. His role encompasses overseeing the editorial process, maintaining the functionality of the website, and providing direction for the platform. He is not solely a Leader, but a part of the team because he, and The Mane Review, understand that this is all only possible through collaboration.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Team */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Our Team</h4>
              <div className="grid gap-6">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2">Ana Clara Herndl</h4>
                  <Badge className="mb-3">Chief Marketing Officer</Badge>
                  <p className="text-muted-foreground leading-relaxed">
                    Ana Clara manages The Mane Review's Instagram presence, overseeing social media strategy and community engagement. With a keen eye for design and content creation, she ensures our online content makes finance accessible and engaging. She also helps bring The Mane Review to more readers, using creativity and consistency to connect people with our investment insights.
                  </p>
                </div>
              </div>
            </div>

            {/* Extended Team */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Editorial Team</h5>
                  <p className="text-sm text-muted-foreground">Experienced editors and market analysts who ensure content quality and accuracy.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Student Contributors</h5>
                  <p className="text-sm text-muted-foreground">Talented students who bring fresh perspectives to financial analysis.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Investment Club</h5>
                  <p className="text-sm text-muted-foreground">A dedicated group that curates our community watchlist and provides market insights.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-1">Advisory Board</h5>
                  <p className="text-sm text-muted-foreground">Industry professionals who guide our editorial standards and strategic direction.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-10"><Card><CardHeader><CardTitle className="flex items-center space-x-2"><Shield className="h-6 w-6 text-secondary" /><span>Editorial Standards</span></CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground leading-relaxed">We maintain high editorial standards to ensure our content is accurate, balanced, and educational. All articles undergo thorough fact-checking and editorial review before publication.</p><div className="space-y-3"><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div><div><h5 className="font-medium">Accuracy & Verification</h5><p className="text-sm text-muted-foreground">All facts and figures are verified through multiple sources</p></div></div><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div><div><h5 className="font-medium">Editorial Independence</h5><p className="text-sm text-muted-foreground">Our content is free from external influence and commercial bias</p></div></div><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div><div><h5 className="font-medium">Educational Focus</h5><p className="text-sm text-muted-foreground">All content serves an educational purpose and avoids speculation</p></div></div><div className="flex items-start space-x-3"><div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div><div><h5 className="font-medium">Student Mentorship</h5><p className="text-sm text-muted-foreground">Student contributors receive guidance and editorial support</p></div></div></div></CardContent></Card></section>
      <section className="space-y-10"><Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"><CardHeader><CardTitle className="text-amber-800 dark:text-amber-200">Important Disclaimers</CardTitle></CardHeader><CardContent className="space-y-4 text-amber-900 dark:text-amber-100"><div className="space-y-3"><p className="font-medium">Educational Content Only</p><p className="text-sm">All content on The Mane Review is provided for educational and informational purposes only. Nothing on this site should be considered as financial, investment, or professional advice.</p></div><Separator className="bg-amber-200 dark:bg-amber-800" /><div className="space-y-3"><p className="font-medium">Not Financial Advice</p><p className="text-sm">We do not provide personalised investment advice or recommendations. Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.</p></div><Separator className="bg-amber-200 dark:bg-amber-800" /><div className="space-y-3"><p className="font-medium">Market Data</p><p className="text-sm">Market data and prices are provided for informational purposes and may be delayed. We are not responsible for any trading decisions made based on this information.</p></div></CardContent></Card></section>
      <section className="space-y-10"><Card><CardHeader><CardTitle className="flex items-center space-x-2"><Mail className="h-6 w-6 text-secondary" /><span>Contact Us</span></CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground">We'd love to hear from you. Whether you have questions, feedback, or ideas for collaboration, don't hesitate to reach out.</p><div className="grid md:grid-cols-2 gap-4"><div className="space-y-3"><h5 className="font-medium">General Enquiries</h5><a href="mailto:admin@themanereview.com" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">admin@themanereview.com</span></a></div><div className="space-y-3"><h5 className="font-medium">Article Submissions & Joining Our Team</h5><a href="mailto:admin@themanereview.com" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">admin@themanereview.com</span></a><p className="text-xs text-muted-foreground">Contact us to submit articles or join The Mane Review</p></div></div></CardContent></Card></section>
    </div>
  );
}