import { NextRequest, NextResponse } from 'next/server';

const BETA_API_BASE = process.env.NEXT_PUBLIC_SPENNX_BETA_URL || 'https://beta.spennx.com/api/v1';
const API_TOKEN = process.env.NEXT_PUBLIC_SPENNX_API_TOKEN || '';

export async function GET() {
    if (!API_TOKEN) {
        return NextResponse.json(
            { error: 'API token not configured' },
            { status: 500 }
        );
    }

    try {
        // The API returns only 50 items per page, so we need to fetch multiple pages
        // Start with page 1 to get the total page count
        const firstResponse = await fetch(`${BETA_API_BASE}/countries?page=1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`,
            },
        });

        if (!firstResponse.ok) {
            return NextResponse.json(
                { error: `SpennX API error: ${firstResponse.status}` },
                { status: firstResponse.status }
            );
        }

        const firstPageData = await firstResponse.json();
        
        // Extract metadata properly
        const meta = firstPageData.meta || {};
        const total = meta.total || 0;
        const perPage = meta.per_page || 50;
        const lastPage = meta.last_page || 1;
        
        // Debug logging
        console.log('[Countries API] Page 1 response meta:', {
            total,
            per_page: perPage,
            current_page: meta.current_page,
            last_page: lastPage,
            from: meta.from,
            to: meta.to,
            dataCount: firstPageData.data?.length
        });

        // Calculate expected pages based on total and per_page
        const calculatedPages = Math.ceil(total / perPage);
        const totalPages = Math.max(lastPage, calculatedPages);
        
        console.log(`[Countries API] Total: ${total}, Per Page: ${perPage}, Calculated Pages: ${calculatedPages}, Last Page: ${lastPage}`);
        
        let allCountries = firstPageData.data || [];

        // If there are more pages, fetch them all
        if (totalPages > 1) {
            console.log(`[Countries API] Fetching ${totalPages - 1} additional pages to get all ${total} countries...`);
            const pagePromises = [];
            
            // Fetch pages 2 and beyond
            for (let page = 2; page <= totalPages; page++) {
                pagePromises.push(
                    fetch(`${BETA_API_BASE}/countries?page=${page}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${API_TOKEN}`,
                        },
                    })
                );
            }

            const additionalResponses = await Promise.all(pagePromises);
            
            for (let i = 0; i < additionalResponses.length; i++) {
                const response = additionalResponses[i];
                const pageNum = i + 2; // Page numbers start from 2
                
                if (response.ok) {
                    const pageData = await response.json();
                    const pageMeta = pageData.meta || {};
                    console.log(`[Countries API] Page ${pageNum} response:`, {
                        dataCount: pageData.data?.length,
                        from: pageMeta.from,
                        to: pageMeta.to
                    });
                    allCountries.push(...(pageData.data || []));
                } else {
                    console.error(`[Countries API] Page ${pageNum} failed:`, response.status);
                }
            }
        }

        console.log(`[Countries API] Combined ${allCountries.length} countries from ${totalPages} page(s)`);

        // Deduplicate countries by iso2 code (just in case there are duplicates)
        const uniqueCountriesMap = new Map();
        for (const country of allCountries) {
            if (country.iso2 && !uniqueCountriesMap.has(country.iso2)) {
                uniqueCountriesMap.set(country.iso2, country);
            }
        }
        const uniqueCountries = Array.from(uniqueCountriesMap.values());

        if (uniqueCountries.length !== allCountries.length) {
            console.log(`[Countries API] Removed ${allCountries.length - uniqueCountries.length} duplicates`);
        }

        // Verify we got all expected countries
        if (total > 0 && uniqueCountries.length < total) {
            console.warn(`[Countries API] WARNING: Expected ${total} countries but only fetched ${uniqueCountries.length}`);
        } else {
            console.log(`[Countries API] SUCCESS: Fetched all ${uniqueCountries.length} of ${total} countries`);
        }

        return NextResponse.json({
            ...firstPageData,
            data: uniqueCountries,
            meta: {
                ...meta,
                total: uniqueCountries.length,
                current_page: 1,
                last_page: 1,
                from: 1,
                to: uniqueCountries.length
            }
        });
    } catch (error) {
        console.error('[Countries Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch countries' },
            { status: 500 }
        );
    }
}
