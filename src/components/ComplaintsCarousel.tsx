import React, { useEffect } from 'react';
import { Calendar, Repeat, Heart } from 'lucide-react';

interface Complaint {
  id: number;
  username: string;
  handle: string;
  content: string;
  date: string;
  likes: number;
  retweets: number;
  color: string;
}

interface ComplaintCardProps {
  complaint: Complaint;
  index: number;
}

const ComplaintsCarousel: React.FC = () => {
  // Complaint data showing contract issues
  const complaints: Complaint[] = [
    {
      id: 1,
      username: "Thabhelo Dube",
      handle: "@thabhelo_tabs",
      content: "Got charged $450 for a 'service fee' that was hidden in page 8 of my gym contract. They refused to cancel when I complained.",
      date: "2 days ago",
      likes: 237,
      retweets: 89,
      color: "106, 90, 255" // FinePrint purple
    },
    {
      id: 2,
      username: "Sibusisiwe Ndlovu",
      handle: "@bucie_n",
      content: "My apartment lease had vague language about 'reasonable wear and tear.' Ended up losing my entire security deposit over normal use.",
      date: "5 days ago",
      likes: 456,
      retweets: 134,
      color: "106, 90, 255" // FinePrint purple
    },
    {
      id: 3,
      username: "Mike Sparks",
      handle: "@mike_financial",
      content: "Beware of 'introductory offers' in financial contracts. My interest rate jumped from 2% to 19% after 3 months.",
      date: "1 week ago",
      likes: 892,
      retweets: 341,
      color: "106, 90, 255" // FinePrint purple
    },
    {
      id: 4,
      username: "Emily Chen",
      handle: "@em_chen_design",
      content: "Freelancers! Always check IP clauses. My client contract had language giving them rights to ALL my work, not just the project.",
      date: "3 days ago",
      likes: 721,
      retweets: 215,
      color: "232, 65, 66" // Red accent from alert icon
    },
    {
      id: 5,
      username: "James Wilson",
      handle: "@wilson_james",
      content: "My subscription auto-renewed for a YEAR with no warning. The 'cancel anytime' had fine print requiring 60-day written notice.",
      date: "4 days ago",
      likes: 512,
      retweets: 178,
      color: "78, 184, 127" // Green from refund icon
    },
    {
      id: 6,
      username: "Priya Patel",
      handle: "@priya_tech",
      content: "Read the data sharing terms! My 'free' app was selling my browser history to advertisers. It was in section 15 of the ToS.",
      date: "1 week ago",
      likes: 876,
      retweets: 432,
      color: "106, 90, 255" // FinePrint purple
    },
    {
      id: 7,
      username: "Jaden Mbele",
      handle: "@andilejmbele",
      content: "Lost access to my cloud storage when the company changed their pricing model. My files were held hostage until I upgraded.",
      date: "2 weeks ago",
      likes: 340,
      retweets: 128,
      color: "232, 65, 66" // Red accent
    },
    {
      id: 8,
      username: "Kim Zuze",
      handle: "@kimzuze",
      content: "The 'unlimited' hosting package had hidden bandwidth caps in the fine print. My site went down during a product launch.",
      date: "1 week ago",
      likes: 654,
      retweets: 298,
      color: "78, 184, 127" // Green
    },
    {
      id: 9,
      username: "Thomas Reed",
      handle: "@thomasreed__",
      content: "Signed up for a 'no-fee' credit card that actually had 12 different hidden fees buried in a 30-page agreement.",
      date: "3 days ago",
      likes: 431,
      retweets: 187,
      color: "106, 90, 255" // FinePrint purple
    },
    {
      id: 10,
      username: "Olivia Chen",
      handle: "@olivia_c",
      content: "My airline ticket's 'flexible change policy' still charged me $200 to change my flight due to illness. It was in tiny print.",
      date: "6 days ago",
      likes: 528,
      retweets: 242,
      color: "106, 90, 255" // FinePrint purple
    }
  ];

  // Complaint card component
  const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, index }) => (
    <div 
      className="card" 
      style={{
        "--index": index,
        "--color-card": complaint.color
      } as React.CSSProperties}
    >
      <div className="img p-3 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center mb-2">
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-md" 
              style={{ backgroundColor: `rgba(${complaint.color}, 0.8)` }}
            >
              {complaint.username.charAt(0)}
            </div>
            <div className="ml-2 text-left">
              <p className="font-medium text-white text-sm">{complaint.username}</p>
              <p className="text-white text-opacity-70 text-xs">{complaint.handle}</p>
            </div>
          </div>
          
          <div className="overflow-hidden mb-2 text-left">
            <p className="text-white text-sm line-clamp-3">{complaint.content}</p>
          </div>
        </div>
        
        <div className="flex text-white text-opacity-80 text-xs justify-between border-t border-white border-opacity-20 pt-2">
          <div className="flex items-center">
            <Calendar size={10} className="mr-1" />
            {complaint.date}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Heart size={10} className="mr-1" />
              {complaint.likes}
            </div>
            <div className="flex items-center">
              <Repeat size={10} className="mr-1" />
              {complaint.retweets}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // CSS for the carousel with responsive design
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        width: 100vw;
        margin-left: calc(-50vw + 50%);
        height: 480px;
        position: relative;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: linear-gradient(to right, rgba(79, 70, 229, 0.02), rgba(67, 56, 202, 0.05), rgba(79, 70, 229, 0.02));
        backdrop-filter: blur(10px);
        box-shadow: inset 0 0 100px rgba(79, 70, 229, 0.03);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .inner {
        --w: min(320px, calc(100vw - 40px));
        --h: min(170px, calc(100vw * 0.4));
        --translateZ: calc((var(--w) + var(--h)) + 20px);
        --rotateX: -5deg;
        --perspective: 1000px;
        position: absolute;
        width: var(--w);
        height: var(--h);
        top: 15%;
        left: calc(50% - (var(--w) / 2) - 2.5px);
        z-index: 2;
        transform-style: preserve-3d;
        transform: perspective(var(--perspective));
        animation: rotating 90s linear infinite;
      }
      @keyframes rotating {
        from {
          transform: perspective(var(--perspective)) rotateX(var(--rotateX))
            rotateY(0);
        }
        to {
          transform: perspective(var(--perspective)) rotateX(var(--rotateX))
            rotateY(1turn);
        }
      }
      .card {
        position: absolute;
        border: 2px solid rgba(var(--color-card), 0.7);
        border-radius: 12px;
        overflow: hidden;
        inset: 0;
        transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
          translateZ(var(--translateZ));
        box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 50px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 26px -18px inset;
        backdrop-filter: blur(5px);
      }
      .img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: rgba(0, 0, 0, 0.65)
          radial-gradient(
            circle,
            rgba(var(--color-card), 0.3) 0%,
            rgba(var(--color-card), 0.15) 80%,
            rgba(var(--color-card), 0.1) 100%
          );
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .wrapper {
          height: 400px;
        }
        .inner {
          --w: min(260px, calc(100vw - 40px));
          --h: min(140px, calc(100vw * 0.4));
          --translateZ: calc((var(--w) + var(--h)) + 10px);
        }
      }
      
      @media (max-width: 480px) {
        .wrapper {
          height: 340px;
        }
        .inner {
          --w: min(220px, calc(100vw - 40px));
          --h: min(120px, calc(100vw * 0.4));
          --translateZ: calc((var(--w) + var(--h)) + 5px);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-full py-8 md:py-12">
      <h2 className="text-xl md:text-2xl tracking-tight font-bold text-center mb-4 md:mb-6 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Real User Complaints About Hidden Contract Traps</h2>
      
      <div className="wrapper w-full h-[340px] md:h-[400px] lg:h-[480px] relative backdrop-blur-sm bg-indigo-900/5">
        <div className="inner" style={{"--quantity": complaints.length} as React.CSSProperties}>
          {complaints.map((complaint, index) => (
            <ComplaintCard key={complaint.id} complaint={complaint} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsCarousel; 