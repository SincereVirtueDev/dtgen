import React, { useEffect } from 'react';
import { useGenealogyStore } from '../store/useGenealogyStore';
import { BookOpen, Download } from 'lucide-react';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef((props: any, ref: any) => {
  const lineHeight = props.smallFont ? 24 : 32;
  const fontSizeClass = props.smallFont ? "text-[13px]" : "text-lg";

  return (
    <div 
      className="bg-[#faf8f5] shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] border-r border-[#e2d5c3] h-full relative" 
      ref={ref}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #e2d5c3 ${lineHeight - 1}px, #e2d5c3 ${lineHeight}px)`,
          backgroundPosition: '0 0'
        }}
      />
      <div className={`py-16 px-10 text-gray-800 ${fontSizeClass} text-justify h-full relative z-10`} style={{ lineHeight: `${lineHeight}px` }}>
        {props.children}
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-[#8b5a2b] font-semibold bg-[#faf8f5] inline-block mx-auto w-16" style={{ lineHeight: `${lineHeight}px` }}>
          - {props.number} -
        </div>
      </div>
    </div>
  );
});

export const HistoryPage: React.FC = () => {
  const { familyTrees, persons, marriages, fetchData, loading } = useGenealogyStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Base book size: width 900 (2 * 450), height 636
        // We add a tiny bit of padding (0.95 factor) to ensure it doesn't touch the exact edges
        let newScale = Math.min(clientWidth / 900, clientHeight / 636) * 0.95;
        if (newScale > 1.5) newScale = 1.5; // Prevent it from getting too absurdly huge on 4K screens
        setScale(newScale);
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const defaultTree = familyTrees[0];

  const handleDownloadFullPDF = () => {
    const url = `http://localhost:8000/api/family_trees/pdf`;
    window.open(url, '_blank');
  };

  // Pagination algorithm
  const PERSONS_PER_PAGE = 2; // 2 persons per page for comfortable A4 reading
  
  const rootPerson = persons.find(p => p.generation === 1 && p.gender === 'M') || persons[0];
  const bloodlinePersons = persons.filter(p => 
    p.id === rootPerson?.id || p.father_id != null || p.mother_id != null
  ).sort((a, b) => {
    const genA = a.generation || 1;
    const genB = b.generation || 1;
    if (genA !== genB) return genA - genB;
    
    const yearA = a.birth_year ? parseInt(a.birth_year) : 9999;
    const yearB = b.birth_year ? parseInt(b.birth_year) : 9999;
    if (yearA !== yearB) return yearA - yearB;
    
    return (a.birth_order || 99) - (b.birth_order || 99);
  });

  const estimateLines = (p: any, spouses: any[]) => {
    let lines = 1; // H3 title
    const bioText = `${p.gender === 'M' ? 'Ông' : 'Bà'} sinh năm ${p.birth_year || 'không rõ'}, quê quán tại ${p.origin_place || p.birth_place || 'chưa rõ'}. ${p.bio ? ` Sinh thời, ${p.bio}` : ' Nay thông tin về tiểu sử chưa được ghi chép đầy đủ, rất mong con cháu sau này bổ sung.'}${p.status === 'DECEASED' ? ` Người đã từ trần vào năm ${p.death_year || 'không rõ'}, phần mộ nay đặt tại ${p.burial_place || 'chưa rõ'}.` : ''}`;
    lines += Math.ceil(bioText.length / 45);
    
    for (const s of spouses) {
      const sp = s.spouse;
      const rankDisplay = s.marriage.rank && s.marriage.rank.toUpperCase() !== 'KHÔNG RÕ' && s.marriage.rank.toUpperCase() !== 'CHƯA RÕ' && spouses.length > 1 ? ` (${s.marriage.rank})` : '';
      const spouseText = `Hôn phối${rankDisplay}: ${sp.full_name}. ${sp.birth_year ? ` Sinh năm ${sp.birth_year}` : ''}${sp.origin_place || sp.birth_place ? `, quê quán tại ${sp.origin_place || sp.birth_place}` : ''}.${sp.bio ? ` ${sp.bio}` : ''}${sp.status === 'DECEASED' ? ` Đã mất năm ${sp.death_year || 'không rõ'}${sp.burial_place ? `, phần mộ tại ${sp.burial_place}` : ''}.` : ''}`;
      lines += Math.ceil(spouseText.length / 45);
    }
    return lines;
  };

  const personPages: { persons: any[], smallFont: boolean }[] = [];
  let currentPage: any[] = [];
  let currentLines = 0;

  for (const p of bloodlinePersons) {
    const personMarriages = marriages.filter(m => m.husband_id === p.id || m.wife_id === p.id);
    const spouses = personMarriages.map(m => {
      const spId = p.gender === 'M' ? m.wife_id : m.husband_id;
      const sp = persons.find(s => s.id === spId);
      return { spouse: sp, marriage: m };
    }).filter(s => s.spouse != null);

    const pLines = estimateLines(p, spouses);
    const linesWithSpacing = pLines + (currentPage.length > 0 ? 1 : 0);

    if (currentLines + linesWithSpacing > 13) {
      if (currentPage.length > 0) {
        personPages.push({ persons: currentPage, smallFont: false });
        currentPage = [p];
        currentLines = pLines;
      } else {
        personPages.push({ persons: [p], smallFont: true });
        currentPage = [];
        currentLines = 0;
      }
    } else {
      currentPage.push(p);
      currentLines += linesWithSpacing;
    }
  }
  if (currentPage.length > 0) {
    personPages.push({ persons: currentPage, smallFont: false });
  }

  return (
    <div className="flex flex-col h-full bg-[#e8e4db] items-center py-4 overflow-hidden">
      
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-3xl font-black text-[#5c3a21] uppercase tracking-widest leading-[32px] flex items-center justify-center">
          <BookOpen className="w-6 h-6 mr-3" />
          Phả Ký
        </h1>
        <p className="text-sm text-[#8b5a2b] font-semibold mb-2">
          {defaultTree ? defaultTree.name : 'Gia Phả Dòng Họ'}
        </p>
        <div className="flex items-center justify-center">
          <button 
            onClick={handleDownloadFullPDF}
            className="inline-flex items-center text-sm font-semibold bg-[#8b5a2b] text-white px-4 py-1.5 rounded-full shadow hover:bg-[#5c3a21] transition-colors"
            title="Tải toàn bộ Phả Ký (PDF)"
          >
            <Download className="w-4 h-4 mr-2" /> TẢI BẢN PDF
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 leading-[32px]">Đang biên soạn phả ký...</p>
      ) : (
        <div ref={containerRef} className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
          <div 
            style={{ 
              width: 900, 
              height: 636, 
              transform: `scale(${scale})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <HTMLFlipBook 
              width={450} 
              height={636} 
              size="fixed"
              minWidth={450}
              maxWidth={450}
              minHeight={636}
              maxHeight={636}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              className="flipbook-container shadow-2xl mx-auto"
            >
            {/* Page 1: Cover / Intro */}
            <Page number={1}>
              <div className="space-y-8">
                <section>
                  <p className="indent-8 leading-[32px]">
                    {defaultTree?.description || 
                     'Gia phả là cuốn sách ghi chép lại nguồn gốc, lịch sử và các thế hệ của một dòng họ. Uống nước nhớ nguồn, làm con phải nhớ công ơn sinh thành dưỡng dục của tổ tiên, ông bà, cha mẹ. Cuốn phả ký này được lập ra nhằm lưu truyền cho con cháu mai sau biết rõ cội nguồn của mình.'}
                  </p>
                </section>
                <section>
                  <h2 className="text-2xl font-bold text-[#5c3a21] leading-[32px] text-center mt-16 mb-8">
                    CÁC BẬC TIỀN NHÂN
                  </h2>
                </section>
              </div>
            </Page>

            {/* Pages: Persons */}
            {personPages.map((pageData, index) => (
              <Page number={index + 2} key={`page-${index}`} smallFont={pageData.smallFont}>
                <div className="space-y-8">
                  {pageData.persons.map((p: any) => {
                    const personMarriages = marriages.filter(m => m.husband_id === p.id || m.wife_id === p.id);
                    const spouses = personMarriages.map(m => {
                      const spId = p.gender === 'M' ? m.wife_id : m.husband_id;
                      const sp = persons.find(s => s.id === spId);
                      return { spouse: sp, marriage: m };
                    }).filter(s => s.spouse != null);

                    return (
                      <div key={p.id}>
                        <h3 className="font-bold text-xl text-[#8b5a2b] leading-[32px]">
                          Đời thứ {p.generation}: {p.full_name}
                        </h3>
                        <p className="indent-8 leading-[32px]">
                          {p.gender === 'M' ? 'Ông' : 'Bà'} sinh năm {p.birth_year || 'không rõ'}, 
                          quê quán tại {p.origin_place || p.birth_place || 'chưa rõ'}. 
                          {p.bio ? ` Sinh thời, ${p.bio}` : ' Nay thông tin về tiểu sử chưa được ghi chép đầy đủ, rất mong con cháu sau này bổ sung.'}
                          {p.status === 'DECEASED' && ` Người đã từ trần vào năm ${p.death_year || 'không rõ'}, phần mộ nay đặt tại ${p.burial_place || 'chưa rõ'}.`}
                        </p>
                        {spouses.length > 0 && spouses.map((s) => {
                          const sp = s.spouse;
                          const rankDisplay = s.marriage.rank && s.marriage.rank.toUpperCase() !== 'KHÔNG RÕ' && s.marriage.rank.toUpperCase() !== 'CHƯA RÕ' && spouses.length > 1 ? ` (${s.marriage.rank})` : '';
                          return (
                            <p key={sp!.id} className="indent-8 leading-[32px] text-[#5c3a21]">
                              <strong>Hôn phối{rankDisplay}:</strong> {sp!.full_name}. 
                              {sp!.birth_year ? ` Sinh năm ${sp!.birth_year}` : ''}
                              {sp!.origin_place || sp!.birth_place ? `, quê quán tại ${sp!.origin_place || sp!.birth_place}` : ''}.
                              {sp!.bio ? ` ${sp!.bio}` : ''}
                              {sp!.status === 'DECEASED' && ` Đã mất năm ${sp!.death_year || 'không rõ'}${sp!.burial_place ? `, phần mộ tại ${sp!.burial_place}` : ''}.`}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </Page>
            ))}

            {/* Final Page: Outro */}
            <Page number={personPages.length + 2}>
              <div className="space-y-8">
                <section className="text-center">
                  <h2 className="text-2xl font-bold text-[#5c3a21] leading-[32px] mb-8 mt-8">
                    HẬU THẾ VÀ TIẾP NỐI
                  </h2>
                  <p className="indent-8 leading-[32px] text-justify">
                    Dòng chảy của huyết mạch, sự nghiệp và truyền thống gia phong của tổ tiên để lại sẽ được các thế hệ con cháu kế thừa và tiếp nối không ngừng.
                  </p>
                  <p className="indent-8 leading-[32px] text-justify">
                    Những trang phả ký này không chỉ là những dòng chữ ghi lại quá khứ, mà còn là lời nhắc nhở sâu sắc để hậu thế luôn sống xứng đáng với cội nguồn, luôn đoàn kết, yêu thương và giúp đỡ lẫn nhau.
                  </p>
                  <div className="mt-16 font-bold text-[#8b5a2b] text-xl leading-[32px] italic">
                    -- Còn tiếp nối --
                  </div>
                </section>
              </div>
            </Page>

          </HTMLFlipBook>
          </div>
        </div>
      )}
    </div>
  );
};
