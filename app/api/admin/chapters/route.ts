import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');
    const term = searchParams.get('term');

    const supabase = supabaseServer();
    let query = supabase
      .from('chapters')
      .select('*');

    // 如果有篩選條件，套用篩選
    if (gradeId) {
      query = query.eq('grade_id', gradeId);
    }
    if (term) {
      query = query.eq('term', term);
    }

    const { data, error } = await query.order('sort_order');

    if (error) throw error;

    // 設置響應頭以防止緩存
    const response = NextResponse.json({ data });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '取得章節失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, grade_id, term, sort_order } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: '缺少必要欄位：id 和 title' },
        { status: 400 }
      );
    }

    // 驗證 grade_id 和 term（如果提供）
    const validGradeIds = ['J1-MATH', 'J2-MATH', 'J3-MATH', 'J2-SCI', 'J3-SCI'];
    const gradeId = grade_id || 'J1-MATH'; // 預設值
    if (!validGradeIds.includes(gradeId)) {
      return NextResponse.json(
        { error: `無效的 grade_id: ${gradeId}` },
        { status: 400 }
      );
    }

    const validTerms = ['upper', 'lower'];
    const chapterTerm = term || 'upper'; // 預設值
    if (!validTerms.includes(chapterTerm)) {
      return NextResponse.json(
        { error: `無效的 term: ${chapterTerm}` },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    
    // 先檢查章節 ID 是否已存在
    const { data: existingChapter } = await supabase
      .from('chapters')
      .select('id, title')
      .eq('id', id)
      .single();

    if (existingChapter) {
      return NextResponse.json(
        { error: `章節 ID "${id}" 已存在（目前標題：${existingChapter.title}）。請使用不同的 ID 或編輯現有章節。` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        id,
        title,
        grade_id: gradeId,
        term: chapterTerm,
        sort_order: sort_order || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // 處理其他可能的資料庫錯誤
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return NextResponse.json(
          { error: `章節 ID "${id}" 已存在。請使用不同的 ID。` },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '新增章節失敗' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oldId = searchParams.get('id');

    if (!oldId) {
      return NextResponse.json(
        { error: '缺少 id 參數' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id: newId, ...updateFields } = body;
    const supabase = supabaseServer();

    // 如果 ID 需要修改
    if (newId && newId !== oldId) {
      // 檢查新 ID 是否已存在
      const { data: existingChapters, error: checkError } = await supabase
        .from('chapters')
        .select('id')
        .eq('id', newId);

      if (checkError) {
        return NextResponse.json(
          { error: '檢查章節 ID 失敗：' + checkError.message },
          { status: 500 }
        );
      }

      if (existingChapters && existingChapters.length > 0) {
        return NextResponse.json(
          { error: `章節 ID "${newId}" 已存在。請使用不同的 ID。` },
          { status: 400 }
        );
      }

      // 在 PostgreSQL 中，由於外鍵約束，我們需要先更新所有外鍵表，然後更新主鍵
      // 但實際上，PostgreSQL 不允許在有外鍵引用的情況下直接更新主鍵
      // 所以我們需要使用一個策略：先獲取舊資料，插入新記錄，更新外鍵，刪除舊記錄

      // 1. 獲取舊章節資料
      const { data: oldChapter, error: fetchOldError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', oldId)
        .single();

      if (fetchOldError || !oldChapter) {
        return NextResponse.json(
          { error: '找不到要更新的章節' },
          { status: 404 }
        );
      }

      // 2. 創建新章節記錄（使用新 ID 和更新的資料）
      // 確保 is_active 保持為 true（如果沒有明確設置）
      const newChapterData = {
        id: newId,
        title: updateFields.title !== undefined ? updateFields.title : oldChapter.title,
        sort_order: updateFields.sort_order !== undefined ? updateFields.sort_order : oldChapter.sort_order,
        is_active: updateFields.is_active !== undefined ? updateFields.is_active : (oldChapter.is_active !== false), // 預設為 true
        created_at: oldChapter.created_at, // 保留原始創建時間
      };

      const { error: insertError } = await supabase
        .from('chapters')
        .insert(newChapterData);

      if (insertError) throw insertError;

      // 3. 獲取所有相關的題型，以便更新它們的 ID
      const { data: oldTypes, error: fetchTypesError } = await supabase
        .from('question_types')
        .select('id, code')
        .eq('chapter_id', oldId);

      if (fetchTypesError) {
        await supabase.from('chapters').delete().eq('id', newId);
        throw fetchTypesError;
      }

      // 4. 獲取完整的題型資料以便重新創建
      const { data: oldTypesFull, error: fetchTypesFullError } = await supabase
        .from('question_types')
        .select('*')
        .eq('chapter_id', oldId);

      if (fetchTypesFullError) {
        await supabase.from('chapters').delete().eq('id', newId);
        throw fetchTypesFullError;
      }

      // 5. 處理題型和題目的更新
      if (oldTypesFull && oldTypesFull.length > 0) {
        // 建立舊ID到新ID的映射
        const typeIdMapping: Record<string, string> = {};
        
        // 先創建所有新的題型記錄
        for (const type of oldTypesFull) {
          const oldTypeId = type.id;
          // 提取 code
          let code = type.code || '';
          if (!code) {
            const parts = oldTypeId.split('-');
            const chapterParts = oldId.split('-');
            if (parts.length > chapterParts.length) {
              code = parts.slice(chapterParts.length).join('-');
            } else {
              code = parts[parts.length - 1] || '';
            }
          }
          
          const newTypeId = `${newId}-${code}`;
          typeIdMapping[oldTypeId] = newTypeId;

          // 創建新的題型記錄（使用新 ID）
          const { error: insertTypeError } = await supabase
            .from('question_types')
            .insert({
              id: newTypeId,
              chapter_id: newId,
              name: type.name,
              code: type.code,
              description: type.description,
              sort_order: type.sort_order,
              is_active: type.is_active,
              created_at: type.created_at,
            });

          if (insertTypeError) {
            // 如果插入失敗，清理已創建的新章節
            await supabase.from('chapters').delete().eq('id', newId);
            throw insertTypeError;
          }
        }

        // 更新所有相關題目的 chapter_id 和 type_id
        for (const [oldTypeId, newTypeId] of Object.entries(typeIdMapping)) {
          const { error: updateQuestionsByTypeError } = await supabase
            .from('questions')
            .update({ chapter_id: newId, type_id: newTypeId })
            .eq('type_id', oldTypeId);

          if (updateQuestionsByTypeError) {
            // 清理已創建的新章節和題型
            await supabase.from('question_types').delete().eq('chapter_id', newId);
            await supabase.from('chapters').delete().eq('id', newId);
            throw updateQuestionsByTypeError;
          }
        }

        // 更新 question_attempts 的 type_id
        for (const [oldTypeId, newTypeId] of Object.entries(typeIdMapping)) {
          const { error: updateAttemptsTypeError } = await supabase
            .from('question_attempts')
            .update({ chapter_id: newId, type_id: newTypeId })
            .eq('type_id', oldTypeId);

          if (updateAttemptsTypeError) {
            await supabase.from('question_types').delete().eq('chapter_id', newId);
            await supabase.from('chapters').delete().eq('id', newId);
            throw updateAttemptsTypeError;
          }
        }

        // 刪除舊的題型記錄
        for (const type of oldTypesFull) {
          const { error: deleteTypeError } = await supabase
            .from('question_types')
            .delete()
            .eq('id', type.id);

          if (deleteTypeError) {
            // 如果刪除失敗，嘗試恢復
            await supabase.from('question_types').delete().eq('chapter_id', newId);
            await supabase.from('chapters').delete().eq('id', newId);
            throw deleteTypeError;
          }
        }
      } else {
        // 如果沒有題型，至少更新題目的 chapter_id
        const { error: updateQuestionsError } = await supabase
          .from('questions')
          .update({ chapter_id: newId })
          .eq('chapter_id', oldId);

        if (updateQuestionsError) {
          await supabase.from('chapters').delete().eq('id', newId);
          throw updateQuestionsError;
        }
      }

      // 6. 更新 student_sessions 表的 chapter_id
      const { error: updateSessionsError } = await supabase
        .from('student_sessions')
        .update({ chapter_id: newId })
        .eq('chapter_id', oldId);

      if (updateSessionsError) {
        await supabase.from('chapters').delete().eq('id', newId);
        throw updateSessionsError;
      }

      // 7. 更新 question_attempts 表中沒有 type_id 但 chapter_id 匹配的記錄
      const { error: updateAttemptsChapterError } = await supabase
        .from('question_attempts')
        .update({ chapter_id: newId })
        .eq('chapter_id', oldId)
        .is('type_id', null);

      if (updateAttemptsChapterError) {
        if (oldTypesFull && oldTypesFull.length > 0) {
          await supabase.from('question_types').delete().eq('chapter_id', newId);
        }
        await supabase.from('chapters').delete().eq('id', newId);
        throw updateAttemptsChapterError;
      }

      // 8. 刪除舊章節記錄
      // 由於外鍵約束，如果相關的題型和題目已經更新到新章節，舊章節應該可以刪除
      // 但為了安全，先檢查是否還有未更新的資料
      const { data: remainingTypes, error: checkRemainingTypesError } = await supabase
        .from('question_types')
        .select('id')
        .eq('chapter_id', oldId)
        .limit(1);

      if (checkRemainingTypesError) {
        await supabase.from('chapters').delete().eq('id', newId);
        throw checkRemainingTypesError;
      }

      if (remainingTypes && remainingTypes.length > 0) {
        // 還有未更新的題型，不應該刪除舊章節
        await supabase.from('chapters').delete().eq('id', newId);
        return NextResponse.json(
          { error: '仍有題型未更新，無法刪除舊章節' },
          { status: 500 }
        );
      }

      // 檢查是否還有未更新的題目
      const { data: remainingQuestions, error: checkRemainingQuestionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('chapter_id', oldId)
        .limit(1);

      if (checkRemainingQuestionsError) {
        await supabase.from('chapters').delete().eq('id', newId);
        throw checkRemainingQuestionsError;
      }

      if (remainingQuestions && remainingQuestions.length > 0) {
        // 還有未更新的題目，不應該刪除舊章節
        await supabase.from('chapters').delete().eq('id', newId);
        return NextResponse.json(
          { error: '仍有題目未更新，無法刪除舊章節' },
          { status: 500 }
        );
      }

      // 確認沒有未更新的資料後，刪除舊章節
      // 先將舊章節設置為 is_active = false，然後再刪除（這樣即使刪除失敗，舊章節也不會出現在前端）
      const { error: deactivateError } = await supabase
        .from('chapters')
        .update({ is_active: false })
        .eq('id', oldId);

      if (deactivateError) {
        // 如果設置 is_active 失敗，嘗試恢復新章節
        await supabase.from('chapters').delete().eq('id', newId);
        throw new Error('無法停用舊章節：' + deactivateError.message);
      }

      // 然後刪除舊章節（使用 CASCADE 應該會自動刪除相關資料）
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('id', oldId);

      if (deleteError) {
        // 如果刪除失敗，舊章節已經是 is_active = false，不會影響前端
        // 但仍記錄錯誤，並嘗試再次刪除
        console.warn('第一次刪除舊章節失敗，嘗試再次刪除:', deleteError);
        
        // 再次嘗試刪除
        const { error: retryDeleteError } = await supabase
          .from('chapters')
          .delete()
          .eq('id', oldId);
          
        if (retryDeleteError) {
          console.warn('再次刪除舊章節仍然失敗，但舊章節已設置為非活動狀態:', retryDeleteError);
          // 不拋出錯誤，因為舊章節已經不會出現在前端了（is_active = false）
        }
      }

      // 9. 驗證新章節是否成功創建，並確認舊章節已被停用或刪除
      const { data: verifyChapter, error: verifyError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', newId)
        .single();

      if (verifyError || !verifyChapter) {
        // 驗證失敗，嘗試恢復
        await supabase.from('chapters').delete().eq('id', newId);
        return NextResponse.json(
          { error: '章節更新後驗證失敗，操作已回滾' },
          { status: 500 }
        );
      }

      // 確認舊章節已被停用或刪除
      const { data: oldChapterCheck } = await supabase
        .from('chapters')
        .select('id, is_active')
        .eq('id', oldId)
        .single();

      if (oldChapterCheck) {
        // 舊章節還在，確保它是非活動狀態
        if (oldChapterCheck.is_active) {
          await supabase
            .from('chapters')
            .update({ is_active: false })
            .eq('id', oldId);
        }
      }

      // 10. 返回新章節資料和操作結果
      return NextResponse.json({ 
        data: verifyChapter,
        message: '章節ID已成功更新',
        oldId,
        newId 
      });
    } else {
      // ID 沒有改變，只需要更新其他欄位
      const { data, error } = await supabase
        .from('chapters')
        .update(updateFields)
        .eq('id', oldId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data });
    }
  } catch (error: any) {
    // 處理主鍵更新錯誤
    if (error.code === '23505') {
      return NextResponse.json(
        { error: '章節 ID 已存在。請使用不同的 ID。' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || '更新章節失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 參數' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '刪除章節失敗' },
      { status: 500 }
    );
  }
}


