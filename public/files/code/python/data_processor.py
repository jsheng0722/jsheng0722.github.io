"""
Python 示例文件
存储位置: /files/code/python/data_processor.py
用途: 数据处理工具
"""

import json
import csv
from typing import Dict, List, Any


class DataProcessor:
    """数据处理器类"""

    def __init__(self, data_path: str = '/files/data'):
        self.data_path = data_path

    def load_json(self, filename: str) -> Dict[str, Any]:
        """
        加载 JSON 文件
        
        Args:
            filename: JSON 文件名
            
        Returns:
            解析后的字典数据
        """
        filepath = f"{self.data_path}/json/{filename}"
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_csv(self, filename: str) -> List[Dict[str, str]]:
        """
        加载 CSV 文件
        
        Args:
            filename: CSV 文件名
            
        Returns:
            解析后的字典列表
        """
        filepath = f"{self.data_path}/csv/{filename}"
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)

    def save_json(self, filename: str, data: Dict[str, Any]) -> None:
        """
        保存 JSON 文件
        
        Args:
            filename: 要保存的文件名
            data: 要保存的数据
        """
        filepath = f"{self.data_path}/json/{filename}"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    processor = DataProcessor()
    profile = processor.load_json('user-profile.json')
    print(f"用户名: {profile['name']}")
    
    expenses = processor.load_csv('expenses.csv')
    print(f"记录数: {len(expenses)}")
