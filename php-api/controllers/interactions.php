<?php
require_once __DIR__ . '/../config/db.php';

function getInteractions(): void {
    $db   = DB::get();
    $page = max(1,(int)($_GET['page']??1)); $limit=20; $offset=($page-1)*$limit;
    $stmt = $db->prepare("SELECT dhi.*, d.drug_name, h.herb_name
        FROM drug_herb_interactions dhi
        JOIN drugs d ON d.id=dhi.drug_id
        JOIN herbs h ON h.id=dhi.herb_id
        ORDER BY dhi.id DESC LIMIT ? OFFSET ?");
    $stmt->execute([$limit,$offset]);
    $total=(int)$db->query('SELECT COUNT(*) FROM drug_herb_interactions')->fetchColumn();
    echo json_encode(['data'=>$stmt->fetchAll(),'total'=>$total,'pages'=>ceil($total/$limit)]);
}

function saveInteraction(array $data, ?int $id=null): void {
    $db=$DB=DB::get();
    $fields=['drug_id','herb_id','severity','description','evidence_level','recommendation'];
    $set=[]; $params=[];
    foreach($fields as $f){ if(array_key_exists($f,$data)){$set[]="$f=?";$params[]=$data[$f];} }
    if($id){ $params[]=$id; $db->prepare('UPDATE drug_herb_interactions SET '.implode(',',$set).' WHERE id=?')->execute($params); echo json_encode(['message'=>'Updated']); }
    else { $cols=implode(',',array_map(fn($s)=>explode('=',$s)[0],$set)); $ph=implode(',',array_fill(0,count($params),'?')); $db->prepare("INSERT INTO drug_herb_interactions ($cols) VALUES ($ph)")->execute($params); echo json_encode(['message'=>'Created','id'=>(int)$db->lastInsertId()]); }
}

function deleteInteraction(int $id): void {
    DB::get()->prepare('DELETE FROM drug_herb_interactions WHERE id=?')->execute([$id]);
    echo json_encode(['message'=>'Deleted']);
}
